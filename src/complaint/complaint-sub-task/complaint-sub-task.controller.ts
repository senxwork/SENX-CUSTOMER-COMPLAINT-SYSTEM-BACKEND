import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintSubTaskService } from './complaint-sub-task.service';
import { Department } from '../departments/department.entity';
import { PublicTicketAccessService } from '../public-ticket-access/public-ticket-access.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';

@Controller('complaint-sub-task')
export class ComplaintSubTaskController {
  private readonly logger = new Logger(ComplaintSubTaskController.name);
  private readonly FRONTEND_URL = 'https://css.senxgroup.com';

  /**
   * Format date เป็น "DD เดือน พ.ศ." เช่น "1 เมษายน 2569"
   */
  private formatThaiDate(date: Date): string {
    if (!date) return '-';
    const d = new Date(date);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  constructor(
    private readonly subTaskService: ComplaintSubTaskService,
    private readonly mailerService: MailerService,
    private readonly publicTicketAccessService: PublicTicketAccessService,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post('backfill-due-date')
  async backfillDueDate() {
    return this.subTaskService.backfillDueDate();
  }

  @Post('ai-generate')
  async aiGenerate(
    @Body() body: { complaint_id: string; case_number: string; job_detail: string },
  ) {
    const result = await this.subTaskService.aiGenerate(
      body.complaint_id,
      body.case_number,
      body.job_detail,
    );

    // Activity Log - AI Generate
    await this.activityLogService.log({
      complaint_id: body.complaint_id,
      action_type: 'AI_GENERATE_TICKETS',
      action_detail: `AI สร้าง Ticket จำนวน ${result.created_count} รายการ`,
      ref_number: body.case_number,
      metadata: {
        created_count: result.created_count,
        tickets: result.tickets?.map((t) => ({
          id: t.id,
          ticket_number: t.ticket_number,
          department: t.department?.department_name,
        })),
      },
    });

    // ส่ง Email แจ้งหน่วยงาน + ส่งแจ้งซ่อมอัตโนมัติ สำหรับแต่ละ Ticket
    const repairErrors: string[] = [];
    if (result.tickets?.length > 0) {
      for (const ticket of result.tickets) {
        if (ticket.department?.id) {
          await this.sendDepartmentAssignmentEmail(
            ticket.id,
            ticket.department.id,
            ticket,
          );
        }

        // ส่งแจ้งซ่อมอัตโนมัติ ถ้าหมวดหมู่เป็น "แจ้งซ่อม"
        const repairResult = await this.subTaskService.checkAndSendRepairRequest(ticket.id);
        if (repairResult?.error) {
          repairErrors.push(`${ticket.ticket_number}: ${repairResult.message}`);
        } else if (repairResult?.data) {
          await this.activityLogService.log({
            complaint_id: body.complaint_id,
            sub_task_id: ticket.id,
            action_type: 'SEND_REPAIR_REQUEST',
            action_detail: `ส่งซ่อม Smartfy Home: ${repairResult.data?.attributes?.serialNumber || '-'}`,
            ref_number: ticket.ticket_number,
            metadata: {
              repair_request_id: repairResult.data?.id,
              serial_number: repairResult.data?.attributes?.serialNumber,
            },
          });
        }
      }
    }

    if (repairErrors.length > 0) {
      result.repair_errors = repairErrors;
    }

    return result;
  }

  @Get('by-parent/:parentId')
  async getByParent(@Param('parentId') parentId: string) {
    return this.subTaskService.findByParent(parentId);
  }

  @Get(':id/repair-request-detail')
  async getRepairRequestDetail(@Param('id') id: string) {
    const detail = await this.subTaskService.getRepairRequestDetail(id);
    return detail || { data: null };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.subTaskService.findOneWithTransactions(id);
  }

  @Post()
  async create(@Body() body: any) {
    const result = await this.subTaskService.createSubTask(body);

    // Activity Log
    await this.activityLogService.log({
      complaint_id: body.complaint_list_id,
      sub_task_id: result.id,
      action_type: 'CREATE_TICKET',
      action_detail: `สร้าง Ticket ใหม่: ${result.ticket_number}`,
      ref_number: result.ticket_number,
    });

    return result;
  }

  /**
   * ส่ง Email แจ้งหน่วยงานเมื่อมอบหมาย Ticket
   */
  private async sendDepartmentAssignmentEmail(
    subTaskId: string,
    departmentId: string,
    ticket: any,
  ): Promise<void> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId },
      });

      this.logger.log(
        `sendDepartmentEmail: dept=${department?.department_name}, contacts=${JSON.stringify(department?.contacts)}`,
      );

      if (department?.contacts?.length > 0) {
        const contactsWithEmail = department.contacts.filter((c) => c.email);
        this.logger.log(`Contacts with email: ${contactsWithEmail.length}`);

        for (const contact of contactsWithEmail) {
          const access = await this.publicTicketAccessService.createAccess(
            subTaskId,
            contact.name,
            contact.email,
          );

          const publicUrl = `${this.FRONTEND_URL}/public/ticket/${access.token}`;

          const statusMap = {
            open: { label: 'Open', bg: '#dbeafe', color: '#1d4ed8' },
            inprogress: { label: 'In Progress', bg: '#fef3c7', color: '#b45309' },
            completed: { label: 'Completed', bg: '#d1fae5', color: '#059669' },
            cancelled: { label: 'Cancelled', bg: '#f1f5f9', color: '#64748b' },
          };
          const statusInfo = statusMap[ticket.status] || statusMap.open;

          await this.mailerService.sendMail({
            to: contact.email,
            subject: `แจ้งเรื่องร้องเรียนโครงการ ${ticket.parent?.project?.project_name_th || '-'}${ticket.parent?.customer_name ? ' จาก ' + ticket.parent.customer_name : ''}`,
            template: 'assignDepartmentTicket',
            context: {
              dataBody: {
                ticket_number: ticket.ticket_number,
                ticket_detail: ticket.ticket_detail,
                project_name: ticket.parent?.project?.project_name_th || '-',
                customer_name: ticket.parent?.customer_name || '-',
                house_name: ticket.parent?.house_name || '-',
                department_name: department.department_name,
                category: ticket.ticketCategory?.category_name || '-',
                status: ticket.status,
                statusLabel: statusInfo.label,
                statusBgColor: statusInfo.bg,
                statusTextColor: statusInfo.color,
                urgent: ticket.urgent,
                due_date: this.formatThaiDate(ticket.due_date),
                contact_name: contact.name,
                public_url: publicUrl,
              },
            },
          });

          this.logger.log(
            `Email sent to ${contact.email} for ticket ${ticket.ticket_number}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send department email: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
    }
  }

  @Put('update-department/:id')
  async updateDepartment(@Param('id') id: string, @Body() body: any) {
    const result = await this.subTaskService.updateDepartment(id, body.department_id);

    // Activity Log
    await this.activityLogService.log({
      complaint_id: result.parent?.complaint_id,
      sub_task_id: id,
      action_type: 'ASSIGN_DEPARTMENT',
      action_detail: `มอบหมายหน่วยงาน: ${result.department?.department_name || '-'}`,
      performed_by: body.performed_by || null,
      ref_number: result.ticket_number,
      metadata: { department_id: body.department_id, department_name: result.department?.department_name },
    });

    await this.sendDepartmentAssignmentEmail(id, body.department_id, result);
    return result;
  }

  @Put('update-category/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const result = await this.subTaskService.updateCategory(id, body.ticket_category_id);

    // Activity Log
    await this.activityLogService.log({
      complaint_id: result.parent?.complaint_id,
      sub_task_id: id,
      action_type: 'UPDATE_TICKET_CATEGORY',
      action_detail: `เปลี่ยนหมวดหมู่: ${result.ticketCategory?.category_name || '-'}`,
      performed_by: body.performed_by || null,
      ref_number: result.ticket_number,
      metadata: { ticket_category_id: body.ticket_category_id },
    });

    // ส่งแจ้งซ่อมอัตโนมัติ ถ้าหมวดหมู่เป็น "แจ้งซ่อม"
    const repairResult = await this.subTaskService.checkAndSendRepairRequest(id);
    if (repairResult?.error) {
      result.repair_error = repairResult.message;
    } else if (repairResult?.data) {
      await this.activityLogService.log({
        complaint_id: result.parent?.complaint_id,
        sub_task_id: id,
        action_type: 'SEND_REPAIR_REQUEST',
        action_detail: `ส่งซ่อม Smartfy Home: ${repairResult.data?.attributes?.serialNumber || '-'}`,
        performed_by: body.performed_by || null,
        ref_number: result.ticket_number,
        metadata: {
          repair_request_id: repairResult.data?.id,
          serial_number: repairResult.data?.attributes?.serialNumber,
        },
      });
    }

    return result;
  }

  @Put('update-expense/:id')
  async updateExpense(@Param('id') id: string, @Body() body: any) {
    const result = await this.subTaskService.updateExpense(id, {
      expense_amount: body.expense_amount,
      expense_description: body.expense_description,
      expense_recorded_by: body.performed_by,
    });

    // Activity Log
    await this.activityLogService.log({
      complaint_id: result.parent?.complaint_id,
      sub_task_id: id,
      action_type: 'UPDATE_EXPENSE',
      action_detail: `บันทึกค่าใช้จ่าย: ${Number(body.expense_amount).toLocaleString()} บาท`,
      performed_by: body.performed_by || null,
      ref_number: result.ticket_number,
      metadata: {
        expense_amount: body.expense_amount,
        expense_description: body.expense_description,
      },
    });

    return result;
  }

  @Put('update-sub-category/:id')
  async updateSubCategory(@Param('id') id: string, @Body() body: any) {
    const result = await this.subTaskService.updateSubCategory(id, body.ticket_sub_category_id);

    // Activity Log
    await this.activityLogService.log({
      complaint_id: result.parent?.complaint_id,
      sub_task_id: id,
      action_type: 'UPDATE_TICKET_SUB_CATEGORY',
      action_detail: `เปลี่ยนหมวดหมู่ย่อย: ${result.ticketSubCategory?.sub_category_name || '-'}`,
      performed_by: body.performed_by || null,
      ref_number: result.ticket_number,
      metadata: { ticket_sub_category_id: body.ticket_sub_category_id },
    });

    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const { performed_by, ...updateData } = body;
    const result = await this.subTaskService.update(id, updateData);

    // ดึง ticket_number สำหรับ Activity Log
    const ticket = await this.subTaskService.findOneWithTransactions(id);

    // Activity Log - generate detailed description
    const statusLabels = { open: 'Open', inprogress: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' };
    const details: string[] = [];
    if (updateData.status) details.push(`เปลี่ยนสถานะเป็น "${statusLabels[updateData.status] || updateData.status}"`);
    if (updateData.urgent === true) details.push('ตั้งค่าเป็น "ด่วน"');
    if (updateData.urgent === false) details.push('ยกเลิก "ด่วน"');
    if (updateData.is_processed === true) details.push('ตั้งค่าเป็น "ดำเนินการ"');
    if (updateData.is_processed === false) details.push('ตั้งค่าเป็น "ไม่ดำเนินการ"');
    if (updateData.ticket_detail) details.push('แก้ไขหัวข้อ Ticket');
    if (updateData.tags) details.push('อัพเดท Tags');

    const actionDetail = details.length > 0 ? details.join(', ') : 'อัพเดท Ticket';
    await this.activityLogService.log({
      sub_task_id: id,
      action_type: updateData.status ? 'UPDATE_TICKET_STATUS' : 'UPDATE_TICKET',
      action_detail: actionDetail,
      performed_by: performed_by || null,
      ref_number: ticket?.ticket_number || null,
      metadata: updateData,
    });

    // อัพเดตสถานะ Case เป็น inprogress อัตโนมัติ เมื่อ Ticket เปลี่ยนเป็น inprogress
    if (updateData.status === 'inprogress') {
      await this.subTaskService.autoSetParentInProgress(id);
    }

    // ส่ง Email แจ้งปิดงานให้หน่วยงานภายนอก เมื่อสถานะเปลี่ยนเป็น completed
    if (updateData.status === 'completed' && ticket?.department) {
      try {
        const department = await this.departmentRepository.findOne({
          where: { id: ticket.department.id },
        });

        if (department?.contacts?.length > 0) {
          const contactsWithEmail = department.contacts.filter((c) => c.email);

          for (const contact of contactsWithEmail) {
            const access = await this.publicTicketAccessService.createAccess(
              id,
              contact.name,
              contact.email,
            );
            const publicUrl = `${this.FRONTEND_URL}/public/ticket/${access.token}`;

            await this.mailerService.sendMail({
              to: contact.email,
              subject: `แจ้งปิดงาน Ticket ${ticket.ticket_number}`,
              template: 'closeTicket',
              context: {
                dataBody: {
                  ticket_number: ticket.ticket_number,
                  ticket_detail: ticket.ticket_detail,
                  department_name: department.department_name,
                  category: ticket.ticketCategory?.category_name || '-',
                  due_date: this.formatThaiDate(ticket.due_date),
                  contact_name: contact.name,
                  public_url: publicUrl,
                },
              },
            });

            this.logger.log(
              `Close-ticket email sent to ${contact.email} for ticket ${ticket.ticket_number}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(`Failed to send close-ticket email: ${error.message}`);
      }
    }

    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Get ticket info before deleting for the log
    const ticket = await this.subTaskService.findOneWithTransactions(id);

    // Activity Log
    await this.activityLogService.log({
      complaint_id: ticket?.parent?.complaint_id,
      sub_task_id: id,
      action_type: 'DELETE_TICKET',
      action_detail: `ลบ Ticket: ${ticket?.ticket_number || id}`,
      ref_number: ticket?.ticket_number,
    });

    return this.subTaskService.deleteSubTask(id);
  }
}
