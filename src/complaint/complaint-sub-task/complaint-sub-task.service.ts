import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { map } from 'rxjs/operators';
import axios from 'axios';
import { AbstractService } from 'src/common/abstract.service';
import { ComplaintSubTask } from './complaint-sub-task.entity';
import { ComplaintList } from '../complaint-list/complaint-list.entity';
import { Department } from '../departments/department.entity';
import { SystemSettingsService } from '../../system-settings/system-settings.service';

@Injectable()
export class ComplaintSubTaskService extends AbstractService {
  private readonly logger = new Logger(ComplaintSubTaskService.name);
  private readonly DEFAULT_N8N_URL =
    'https://n8n.senxpropertyservices.com/webhook-test/182c58abf988324f42bccb36b72d097a';

  constructor(
    @InjectRepository(ComplaintSubTask)
    private readonly subTaskRepository: Repository<ComplaintSubTask>,
    @InjectRepository(ComplaintList)
    private readonly complaintListRepository: Repository<ComplaintList>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly httpService: HttpService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {
    super(subTaskRepository);
  }

  private async getN8nWebhookUrl(): Promise<string> {
    const url = await this.systemSettingsService.get('n8n_webhook_url');
    return url || this.DEFAULT_N8N_URL;
  }

  async generateTicketNumber(): Promise<string> {
    const now = new Date();
    const prefix = `TK-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const result = await this.subTaskRepository.query(
      `SELECT ticket_number FROM "complaint-sub-tasks" WHERE ticket_number LIKE $1 ORDER BY ticket_number DESC LIMIT 1`,
      [`${prefix}-%`]
    );
    let next = 1;
    if (result.length > 0) {
      const last = parseInt(result[0].ticket_number.split('-').pop(), 10);
      if (!isNaN(last)) next = last + 1;
    }
    return `${prefix}-${String(next).padStart(5, '0')}`;
  }

  async findByParent(parentId: string): Promise<ComplaintSubTask[]> {
    // Use query builder to query by foreign key column directly
    return this.subTaskRepository
      .createQueryBuilder('subTask')
      .leftJoinAndSelect('subTask.department', 'department')
      .leftJoinAndSelect('subTask.ticketCategory', 'ticketCategory')
      .leftJoinAndSelect('subTask.ticketSubCategory', 'ticketSubCategory')
      .leftJoinAndSelect('subTask.subTaskTransactions', 'subTaskTransactions')
      .leftJoinAndSelect('subTaskTransactions.user_created', 'tx_user')
      .leftJoinAndSelect('subTaskTransactions.attachedFiles', 'tx_files')
      .where('subTask.complaint_list_id = :parentId', { parentId })
      .orderBy('subTask.created_at', 'ASC')
      .getMany();
  }

  async findOneWithTransactions(id: string): Promise<ComplaintSubTask> {
    return this.subTaskRepository.findOne({
      where: { id },
      relations: [
        'parent',
        'department',
        'ticketCategory',
        'ticketSubCategory',
        'subTaskTransactions',
        'subTaskTransactions.user_created',
        'subTaskTransactions.attachedFiles',
      ],
    });
  }

  /**
   * ถ้า parent complaint ยังเป็น open → เปลี่ยนเป็น inprogress อัตโนมัติ
   */
  async autoSetParentInProgress(ticketId: string): Promise<void> {
    try {
      this.logger.log(`autoSetParentInProgress called with ticketId: ${ticketId}`);
      const ticket = await this.subTaskRepository.findOne({
        where: { id: ticketId },
        relations: ['parent'],
      });
      this.logger.log(`autoSetParentInProgress: ticket found=${!!ticket}, parent=${!!ticket?.parent}, parentStatus=${ticket?.parent?.status}`);
      if (ticket?.parent && ticket.parent.status === 'open') {
        await this.complaintListRepository.update(
          ticket.parent.complaint_id,
          { status: 'inprogress' },
        );
        this.logger.log(`Auto set parent ${ticket.parent.complaint_id} to inprogress`);
      }
    } catch (err) {
      this.logger.error(`autoSetParentInProgress failed: ${err.message}`);
    }
  }

  /**
   * Override update: auto-set completed_at เมื่อเปลี่ยนสถานะเป็น completed/cancelled
   * และ clear completed_at เมื่อเปลี่ยนกลับเป็น open/inprogress
   */
  async update(id: any, data: any): Promise<any> {
    if (data.status === 'completed' || data.status === 'cancelled') {
      data.completed_at = new Date();
    } else if (data.status === 'open' || data.status === 'inprogress') {
      data.completed_at = null;
    }
    return this.subTaskRepository.update(id, data);
  }

  async createSubTask(data: any): Promise<ComplaintSubTask> {
    let retries = 3;
    while (retries > 0) {
      try {
        const ticketNumber = await this.generateTicketNumber();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);

        const subTask = this.subTaskRepository.create({
          ticket_number: ticketNumber,
          ticket_detail: data.ticket_detail,
          ticket_sub_category: data.ticket_sub_category || null,
          status: data.status || 'open',
          tags: data.tags || null,
          due_date: dueDate,
        });

        const savedSubTask = await this.subTaskRepository.save(subTask);

        if (data.complaint_list_id) {
          await this.subTaskRepository.query(
            `UPDATE "complaint-sub-tasks" SET "complaint_list_id" = $1 WHERE "id" = $2`,
            [data.complaint_list_id, savedSubTask.id]
          );
        }

        return this.findOneWithTransactions(savedSubTask.id);
      } catch (error) {
        if (error.code === '23505' && retries > 1) {
          retries--;
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * Backfill due_date สำหรับ ticket เก่าที่ยังไม่มี due_date
   * due_date = created_at + 15 วัน
   */
  async backfillDueDate(): Promise<{ updated: number }> {
    const result = await this.subTaskRepository.query(
      `UPDATE "complaint-sub-tasks" SET "due_date" = "created_at" + INTERVAL '15 days' WHERE "due_date" IS NULL`,
    );
    return { updated: result?.[1] || 0 };
  }

  async deleteSubTask(id: string): Promise<any> {
    return this.subTaskRepository.delete(id);
  }

  async updateDepartment(id: string, departmentId: string): Promise<any> {
    await this.subTaskRepository.query(
      `UPDATE "complaint-sub-tasks" SET "department_id" = $1 WHERE "id" = $2`,
      [departmentId, id]
    );
    return this.findOneWithTransactions(id);
  }

  async updateCategory(id: string, categoryId: string | null): Promise<any> {
    await this.subTaskRepository.query(
      `UPDATE "complaint-sub-tasks" SET "ticket_category_id" = $1 WHERE "id" = $2`,
      [categoryId || null, id]
    );
    return this.findOneWithTransactions(id);
  }

  async updateExpense(id: string, data: { expense_amount: number; expense_description?: string; expense_recorded_by?: string }): Promise<any> {
    await this.subTaskRepository.update(id, {
      expense_amount: data.expense_amount,
      expense_description: data.expense_description || null,
      expense_date: new Date(),
      expense_recorded_by: data.expense_recorded_by || null,
    });
    return this.findOneWithTransactions(id);
  }

  async updateSubCategory(id: string, subCategoryId: string | null): Promise<any> {
    await this.subTaskRepository.query(
      `UPDATE "complaint-sub-tasks" SET "ticket_sub_category_id" = $1 WHERE "id" = $2`,
      [subCategoryId || null, id]
    );
    return this.findOneWithTransactions(id);
  }

  async aiGenerate(
    complaintId: string,
    caseNumber: string,
    jobDetail: string,
  ): Promise<any> {
    try {
      const webhookUrl = await this.getN8nWebhookUrl();
      this.logger.log(`AI Generate: calling n8n webhook (${webhookUrl}) for case ${caseNumber}`);

      // โหลดข้อมูล complaint + project เพื่อส่งให้ AI
      const complaint = await this.complaintListRepository.findOne({
        where: { complaint_id: complaintId },
        relations: ['project'],
      });
      const project = complaint?.project;

      const response = await this.httpService
        .post(webhookUrl, {
          complaint_id: complaintId,
          case_number: caseNumber,
          job_detail: jobDetail,
          project_id: project?.project_id || '',
          project_name: project?.project_name_th || '',
          project_type: project?.project_type || '',
        })
        .pipe(map((res) => res.data))
        .toPromise();
      this.logger.log(`AI Generate: received response for case ${caseNumber}`);

      // Parse tickets from response
      const tickets = Array.isArray(response) ? response : (response?.generated_tickets || []);
      this.logger.log(`AI Generate: ${tickets.length} tickets to create`);

      const createdTickets = [];
      for (const task of tickets) {
        try {
          const data: any = {
            ticket_detail: task.ticket_detail,
            status: task.status || 'open',
            complaint_list_id: complaintId,
          };

          const created = await this.createSubTask(data);

          // Update department, category, sub-category if provided
          if (task.department_id) {
            await this.updateDepartment(created.id, task.department_id);
          }
          if (task.ticket_category_id) {
            await this.updateCategory(created.id, task.ticket_category_id);
          }
          if (task.ticket_sub_category_id) {
            await this.updateSubCategory(created.id, task.ticket_sub_category_id);
          }
          if (task.urgent === true || task.urgent === 'true') {
            await this.subTaskRepository.update(created.id, { urgent: true });
          }
          if (task.is_processed === true || task.is_processed === 'true') {
            await this.subTaskRepository.update(created.id, { is_processed: true });
          } else if (task.is_processed === false || task.is_processed === 'false') {
            await this.subTaskRepository.update(created.id, { is_processed: false });
          }

          const fullTicket = await this.findOneWithTransactions(created.id);
          createdTickets.push(fullTicket);
          this.logger.log(`AI Generate: created ticket ${created.ticket_number}`);
        } catch (err) {
          this.logger.error(`AI Generate: failed to create ticket: ${err.message}`);
        }
      }

      return { created_count: createdTickets.length, tickets: createdTickets };
    } catch (error) {
      this.logger.error(`AI Generate failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า ticket มีหมวดหมู่ "แจ้งซ่อม" หรือไม่ ถ้าใช่ส่ง repair request ไป Smartify API
   * ใช้ axios ตรงๆ (ไม่ผ่าน @nestjs/axios HttpService) เพื่อให้ตรงกับ Postman
   */
  async checkAndSendRepairRequest(ticketId: string): Promise<any> {
    let postUrl = '';
    try {
      const ticket = await this.subTaskRepository.findOne({
        where: { id: ticketId },
        relations: ['ticketCategory', 'parent', 'parent.project'],
      });

      if (!ticket) {
        this.logger.warn(`checkAndSendRepairRequest: ticket ${ticketId} not found`);
        return null;
      }

      // ตรวจว่าหมวดหมู่เป็น "แจ้งซ่อม" และยังไม่เคยส่ง
      if (ticket.ticketCategory?.category_name !== 'แจ้งซ่อม') {
        return null;
      }
      if (ticket.repair_request_id) {
        this.logger.log(`checkAndSendRepairRequest: ticket ${ticketId} already sent (repair_request_id=${ticket.repair_request_id})`);
        return null;
      }

      // ดึง API config จาก settings
      const apiUrl = (await this.systemSettingsService.get('repair_api_url'))?.trim();
      const apiToken = (await this.systemSettingsService.get('repair_api_token'))?.trim();

      if (!apiUrl || !apiToken) {
        this.logger.warn('checkAndSendRepairRequest: Repair API not configured (repair_api_url or repair_api_token missing)');
        return null;
      }

      const project = (ticket.parent as any)?.project;

      // แปลง project_type ภาษาไทย → ภาษาอังกฤษ สำหรับ Smartfy Home API
      const projectType = project?.project_type || '';
      const addressType = projectType === 'แนวสูง' ? 'condo'
        : projectType === 'แนวราบ' ? 'house'
        : 'condo';

      // สร้าง POST body (ครอบทุก field ใน data ตาม Strapi v4 format)
      const body = {
        data: {
          reporterType: 'owner',
          reportFrom: 'smartify',
          address: {
            addressType,
            houseNumber: ticket.parent?.house_name || '',
            locationName: project?.project_name_th || '',
            projectID: project?.project_id || '',
          },
          issueDescription: `${ticket.ticket_detail || ''}\nสร้างโดย : CUSTOMER COMPLAINT CENTER`,
          name: ticket.parent?.customer_name || '',
          tel: ticket.parent?.telephone || '',
          isUrgent: ticket.urgent || false,
        },
      };

      // ใช้ URL จาก settings ตรงๆ (user ใส่ URL เต็มสำหรับ POST)
      postUrl = apiUrl;
      this.logger.log(`checkAndSendRepairRequest: POST URL="${postUrl}" (len=${postUrl.length})`);
      this.logger.log(`checkAndSendRepairRequest: Token length=${apiToken.length}, starts="${apiToken.substring(0, 10)}..."`);
      this.logger.log(`checkAndSendRepairRequest: Body = ${JSON.stringify(body)}`);

      // ใช้ axios ตรงๆ แทน HttpService
      const response = await axios.post(postUrl, body, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      const result = response.data;
      this.logger.log(`checkAndSendRepairRequest: Response status=${response.status}`);
      this.logger.log(`checkAndSendRepairRequest: Response data=${JSON.stringify(result)}`);

      // เก็บผลลัพธ์ลง DB
      const repairId = result?.data?.id;
      const attrs = result?.data?.attributes || {};

      await this.subTaskRepository.update(ticketId, {
        repair_request_id: repairId,
        repair_request_serial: attrs.serialNumber || null,
        repair_request_description: attrs.issueDescription || null,
        repair_request_created_at: attrs.createdAt || null,
      });

      this.logger.log(`checkAndSendRepairRequest: success — repair_request_id=${repairId}, serial=${attrs.serialNumber}`);
      return result;
    } catch (error) {
      this.logger.error(`checkAndSendRepairRequest failed: ${error.message}`);
      this.logger.error(`POST URL used: "${postUrl}"`);
      this.logger.error(`Response status: ${error.response?.status}`);
      this.logger.error(`Response data: ${JSON.stringify(error.response?.data)}`);
      return { error: true, message: error.message };
    }
  }

  /**
   * ดึงรายละเอียด repair request จาก Smartify API แบบ batch
   * รับ array ของ { ticketId, repair_request_id } แล้วดึงข้อมูลทั้งหมดพร้อมกัน
   */
  async getRepairRequestDetailsBatch(
    tickets: { ticketId: string; repair_request_id: number }[],
  ): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    if (!tickets.length) return result;

    const apiGetUrl = await this.systemSettingsService.get('repair_api_get_url');
    const apiToken = await this.systemSettingsService.get('repair_api_token');

    if (!apiGetUrl || !apiToken) return result;

    // ดึงข้อมูลพร้อมกัน (concurrent) แต่จำกัด batch ละ 10
    const batchSize = 10;
    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize);
      const promises = batch.map(async (t) => {
        try {
          const getUrl = apiGetUrl.trim().replace('{id}', String(t.repair_request_id));
          const response = await axios.get(getUrl, {
            headers: { Authorization: `Bearer ${apiToken}` },
            timeout: 10000,
          });
          result.set(t.ticketId, response.data);
        } catch (err) {
          this.logger.warn(`getRepairRequestDetailsBatch: failed for ticket ${t.ticketId}: ${err.message}`);
          result.set(t.ticketId, null);
        }
      });
      await Promise.all(promises);
    }

    return result;
  }

  /**
   * ดึงรายละเอียด repair request จาก Smartify API (proxy ผ่าน backend)
   * ใช้ axios ตรงๆ
   */
  async getRepairRequestDetail(ticketId: string): Promise<any> {
    const ticket = await this.subTaskRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket?.repair_request_id) {
      return null;
    }

    const apiGetUrl = await this.systemSettingsService.get('repair_api_get_url');
    const apiToken = await this.systemSettingsService.get('repair_api_token');

    if (!apiGetUrl || !apiToken) {
      return null;
    }

    // แทนที่ {id} ใน URL ด้วย repair_request_id
    const getUrl = apiGetUrl.trim().replace('{id}', String(ticket.repair_request_id));
    this.logger.log(`getRepairRequestDetail: GET ${getUrl}`);

    const response = await axios.get(getUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    return response.data;
  }
}
