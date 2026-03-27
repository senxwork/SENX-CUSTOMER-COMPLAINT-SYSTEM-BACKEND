import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from '@nestjs/config';
import { Between, Repository } from "typeorm";
import { AbstractService } from 'src/common/abstract.service';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { ComplaintList } from './complaint-list.entity';
import { ComplaintSubTaskService } from '../complaint-sub-task/complaint-sub-task.service';


@Injectable()
export class ComplaintListService extends AbstractService {
    constructor(
        @InjectRepository(ComplaintList) private readonly complaintListRepository: Repository<ComplaintList>,
        @Inject(forwardRef(() => ComplaintSubTaskService))
        private readonly subTaskService: ComplaintSubTaskService,
        private readonly configService: ConfigService,
    ) {
        super(complaintListRepository);
    }

    async generateCaseNumber(): Promise<string> {
        const now = new Date();
        const prefix = `CASE-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const result = await this.complaintListRepository.query(
            `SELECT case_number FROM "complaint-lists" WHERE case_number LIKE $1 ORDER BY case_number DESC LIMIT 1`,
            [`${prefix}-%`]
        );
        let next = 1;
        if (result.length > 0) {
            const last = parseInt(result[0].case_number.split('-').pop(), 10);
            if (!isNaN(last)) next = last + 1;
        }
        return `${prefix}-${String(next).padStart(5, '0')}`;
    }

    async paginate(page = 1, relations = []): Promise<PaginatedResult> {
        const { data, meta } = await super.paginate(page, relations);

        return {
            data: data.map(complaintList => {
                const { ...data } = complaintList;
                return data;
            }),
            meta
        }
    }

    async paginateByFilterddd(filterData: any,page = 1, ): Promise<PaginatedResult> {
        const { data, meta } = await super.paginateByFilter(filterData,page);

        return {
            data: data.map(complaintList => {
                const { ...data } = complaintList;
                return data;
            }),
            meta
        }
    }

 async findEmailByDepartment(condition): Promise<any> {
    return this.repository.find({
      where: { user_id:condition },
    });
  }


  async findReport(
    filterData: any,
    page = 1,
    relations = [],
  ): Promise<PaginatedResult> {
    const responsible_persons = filterData.responsible_persons;
    const project = filterData.project;
    const targetMonth = filterData.targetMonth;
    const textfilter = filterData.textfilter;
    const status = filterData.status;
    const category = filterData.category;
    const jobDepartment = filterData.jobDepartment;
    const user_created = filterData.user_created;

    console.log(filterData);
    const take = 1000000000000000000;
    const queryBuilder = this.repository
      .createQueryBuilder('complaint-lists')
      .leftJoinAndSelect(
        'complaint-lists.complaintJobCatagory',
        'complaintJobCatagory',
      )
      .leftJoinAndSelect('complaint-lists.contactChannel', 'contactChannel')
      .leftJoinAndSelect('complaint-lists.businessUnit', 'businessUnit')
      .leftJoinAndSelect('complaint-lists.jobDepartment', 'jobDepartment')
      .leftJoinAndSelect(
        'complaint-lists.complaintTransaction',
        'complaintTransaction',
      ).leftJoinAndSelect(
        'complaintTransaction.user_created',
        'transactionUserCreated',
      ).leftJoinAndSelect(
        'complaint-lists.omPersons',
        'omPersons',
      )
      .leftJoinAndSelect('complaint-lists.user_created', 'user_created')
      .leftJoinAndSelect('complaint-lists.project', 'project')
      .leftJoinAndSelect(
        'complaint-lists.complaintAttachedFile',
        'complaintAttachedFile',
      )
      .leftJoinAndSelect(
        'complaint-lists.responsible_persons',
        'responsible_persons',
      )
      .leftJoinAndSelect(
        'complaintTransaction.complaintTransactionAttachedFile',
        'complaintTransactionAttachedFile',
      )
      .leftJoinAndSelect('complaint-lists.subTasks', 'subTasks')
      .leftJoinAndSelect('subTasks.department', 'subTaskDepartment')
      .leftJoinAndSelect('subTasks.ticketCategory', 'subTaskTicketCategory')
      .leftJoinAndSelect('subTasks.ticketSubCategory', 'subTaskTicketSubCategory')
      .orderBy('complaint-lists.created_at', 'DESC');
    if (
      responsible_persons !== undefined &&
      (Array.isArray(responsible_persons)
        ? responsible_persons.some((item) => item !== '')
        : responsible_persons !== '')
    ) {
      queryBuilder.andWhere(
        'responsible_persons.user_id IN (:...responsible_persons)',
        { responsible_persons },
      );
    }
    if (
      jobDepartment !== undefined &&
      jobDepartment !== '' &&
      jobDepartment !== null
    ) {
      queryBuilder.andWhere(
        'jobDepartment.job_departments_id IN (:jobDepartment)',
        {
          jobDepartment,
        },
      );
    }

    if (filterData.startDate) {
      queryBuilder.andWhere('complaint-lists.created_at >= :startDate AND complaint-lists.created_at <= :endDate', { startDate: filterData.startDate + ' 00:00:00', endDate: filterData.endDate + ' 23:59:59' });
    }
    if (status) {
      queryBuilder.andWhere(`complaint-lists.status = :status`, { status });
    }

    if (
      user_created !== undefined &&
      (Array.isArray(user_created)
        ? category.some((item) => item !== '')
        : user_created !== '')
    ) {
      queryBuilder.andWhere(`complaint-lists.user_created = :user_created`, {
        user_created,
      });
    }

    if (
      category !== undefined &&
      (Array.isArray(category)
        ? category.some((item) => item !== '')
        : category !== '')
    ) {
      queryBuilder.andWhere('complaintJobCatagory.id IN (:...category)', {
        category,
      });
    }

    const [data, total] = await queryBuilder
      .take(take)
      .skip((page - 1) * take)
      .getManyAndCount();

    // Enrich data with computed fields from subTasks
    const enrichedData = data.map(complaint => {
      const subTaskTags: string[] = [];
      const subTaskDepartmentIds: string[] = [];

      if (complaint.subTasks && Array.isArray(complaint.subTasks)) {
        complaint.subTasks.forEach((st: any) => {
          if (st.tags && Array.isArray(st.tags)) {
            subTaskTags.push(...st.tags);
          }
          if (st.job_departments_id) {
            subTaskDepartmentIds.push(st.job_departments_id);
          }
          if (st.department?.id) {
            subTaskDepartmentIds.push(st.department.id);
          }
        });
      }

      return {
        ...complaint,
        subTaskTags: [...new Set(subTaskTags)],
        subTaskDepartmentIds: [...new Set(subTaskDepartmentIds)],
      };
    });

    if (textfilter) {
      const filteredData = enrichedData.filter((item) => {
        for (const field in item) {
          if (
            typeof item[field] === 'string' &&
            item[field].includes(textfilter)
          ) {
            return true;
          }
        }

        return false;
      });

      return {
        data: filteredData,
        meta: {
          total,
          page,
          last_page: Math.ceil(total / take),
        },
      };
    }
    if (!textfilter) {
      return {
        data: enrichedData,
        meta: {
          total,
          page,
          last_page: Math.ceil(total / take),
        },
      };
    }
  }

  async findChildren(parentId: string): Promise<any[]> {
    return this.complaintListRepository.find({
      where: { parent: { complaint_id: parentId } },
      relations: ['user_created', 'responsible_persons', 'complaintJobCatagory', 'project'],
      order: { created_at: 'DESC' },
    });
  }

  async mockAIGenerate(jobDetail: string): Promise<any[]> {
    const subTasks = [];
    const lines = jobDetail.split('\n').filter(line => line.trim().length > 0);

    if (lines.length > 1) {
      lines.forEach((line, index) => {
        subTasks.push({
          job_detail: line.trim(),
          status: 'open',
          risk_level: 'Low'
        });
      });
    } else {
      subTasks.push({ job_detail: 'Analyze requirements for: ' + jobDetail, status: 'open', risk_level: 'Low' });
      subTasks.push({ job_detail: 'Design solution', status: 'open', risk_level: 'Medium' });
      subTasks.push({ job_detail: 'Implementation', status: 'open', risk_level: 'Medium' });
      subTasks.push({ job_detail: 'Testing & Verification', status: 'open', risk_level: 'Low' });
    }

    return subTasks;
  }

  // Optimized method to get complaints with sub-task data included
  async findAllWithSubTasks(): Promise<any[]> {
    const data = await this.complaintListRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.complaintJobCatagory', 'complaintJobCatagory')
      .leftJoinAndSelect('complaint.contactChannel', 'contactChannel')
      .leftJoinAndSelect('complaint.businessUnit', 'businessUnit')
      .leftJoinAndSelect('complaint.jobDepartment', 'jobDepartment')
      .leftJoinAndSelect('complaint.user_created', 'user_created')
      .leftJoinAndSelect('complaint.project', 'project')
      .leftJoinAndSelect('complaint.responsible_persons', 'responsible_persons')
      .leftJoinAndSelect('complaint.subTasks', 'subTasks')
      .leftJoinAndSelect('subTasks.department', 'subTaskDepartment')
      .leftJoinAndSelect('subTasks.ticketCategory', 'subTaskTicketCategory')
      .leftJoinAndSelect('subTasks.ticketSubCategory', 'subTaskTicketSubCategory')
      .orderBy('complaint.created_at', 'DESC')
      .getMany();

    // Process data to add sub-task summary
    return data.map(complaint => {
      const subTaskTags: string[] = [];
      const subTaskDepartmentIds: string[] = [];
      const subTaskAssignees: any[] = [];

      if (complaint.subTasks && Array.isArray(complaint.subTasks)) {
        complaint.subTasks.forEach((st: any) => {
          if (st.tags && Array.isArray(st.tags)) {
            subTaskTags.push(...st.tags);
          }
          if (st.job_departments_id) {
            subTaskDepartmentIds.push(st.job_departments_id);
          }
          if (st.department?.id) {
            subTaskDepartmentIds.push(st.department.id);
          }
          if (st.responsible_persons && Array.isArray(st.responsible_persons)) {
            subTaskAssignees.push(...st.responsible_persons);
          }
        });
      }

      return {
        ...complaint,
        subTaskTags: [...new Set(subTaskTags)],
        subTaskDepartmentIds: [...new Set(subTaskDepartmentIds)],
        subTaskAssignees
      };
    });
  }

  // Dashboard API - get all complaints with ALL related data
  async findAllForDashboard(): Promise<any> {
    const data = await this.complaintListRepository
      .createQueryBuilder('complaint')
      // Case-level relations
      .leftJoinAndSelect('complaint.complaintJobCatagory', 'complaintJobCatagory')
      .leftJoinAndSelect('complaint.contactChannel', 'contactChannel')
      .leftJoinAndSelect('complaint.businessUnit', 'businessUnit')
      .leftJoinAndSelect('complaint.jobDepartment', 'jobDepartment')
      .leftJoinAndSelect('complaint.user_created', 'user_created')
      .leftJoinAndSelect('complaint.project', 'project')
      .leftJoinAndSelect('complaint.responsible_persons', 'responsible_persons')
      .leftJoinAndSelect('complaint.omPersons', 'omPersons')
      .leftJoinAndSelect('complaint.complaintAttachedFile', 'complaintAttachedFile')
      // Case transactions
      .leftJoinAndSelect('complaint.complaintTransaction', 'complaintTransaction')
      .leftJoinAndSelect('complaintTransaction.user_created', 'txUserCreated')
      .leftJoinAndSelect('complaintTransaction.complaintTransactionAttachedFile', 'txAttachedFile')
      // Sub-tasks (Tickets)
      .leftJoinAndSelect('complaint.subTasks', 'subTasks')
      .leftJoinAndSelect('subTasks.department', 'subTaskDepartment')
      .leftJoinAndSelect('subTasks.ticketCategory', 'subTaskTicketCategory')
      .leftJoinAndSelect('subTasks.ticketSubCategory', 'subTaskTicketSubCategory')
      // Sub-task transactions
      .leftJoinAndSelect('subTasks.subTaskTransactions', 'subTaskTransactions')
      .leftJoinAndSelect('subTaskTransactions.user_created', 'stTxUserCreated')
      .leftJoinAndSelect('subTaskTransactions.attachedFiles', 'stTxAttachedFiles')
      .orderBy('complaint.created_at', 'DESC')
      .addOrderBy('subTasks.created_at', 'ASC')
      .addOrderBy('complaintTransaction.created_at', 'DESC')
      .addOrderBy('subTaskTransactions.created_at', 'DESC')
      .getMany();

    // Add file URLs
    const baseUrl = this.configService.get<string>('API_BASE_URL', '');
    data.forEach((complaint: any) => {
      // Case attached files
      if (complaint.complaintAttachedFile) {
        complaint.complaintAttachedFile.forEach((f: any) => {
          f.file_url = `${baseUrl}/complaint-attachedfile/file/${f.file_name}`;
        });
      }
      // Case transaction files
      if (complaint.complaintTransaction) {
        complaint.complaintTransaction.forEach((tx: any) => {
          if (tx.complaintTransactionAttachedFile) {
            tx.complaintTransactionAttachedFile.forEach((f: any) => {
              f.file_url = `${baseUrl}/complaint-transaction-attachedfile/file/${f.file_name}`;
            });
          }
        });
      }
      // Sub-task transaction files
      if (complaint.subTasks) {
        complaint.subTasks.forEach((st: any) => {
          if (st.subTaskTransactions) {
            st.subTaskTransactions.forEach((tx: any) => {
              if (tx.attachedFiles) {
                tx.attachedFiles.forEach((f: any) => {
                  f.file_url = `${baseUrl}/complaint-sub-task-transection-file/file/${f.file_name}`;
                });
              }
            });
          }
        });
      }
      // User profile images
      if (complaint.user_created?.profile_image) {
        complaint.user_created.profile_image_url = `${baseUrl}/users/file/${complaint.user_created.profile_image}`;
      }
    });

    // Collect tickets that have repair_request_id for batch fetch
    const repairTickets: { ticketId: string; repair_request_id: number }[] = [];
    data.forEach((complaint: any) => {
      if (complaint.subTasks && Array.isArray(complaint.subTasks)) {
        complaint.subTasks.forEach((st: any) => {
          if (st.repair_request_id) {
            repairTickets.push({
              ticketId: st.id,
              repair_request_id: st.repair_request_id,
            });
          }
        });
      }
    });

    // Batch fetch repair details from WECARE API
    const repairDetailsMap = await this.subTaskService.getRepairRequestDetailsBatch(repairTickets);

    // Summary stats
    const totalCases = data.length;
    const statusCounts = { open: 0, inprogress: 0, completed: 0 };
    let totalTickets = 0;
    const ticketStatusCounts = { open: 0, inprogress: 0, completed: 0, resolved: 0 };
    let totalRepairRequests = 0;
    const repairStatusCounts: Record<string, number> = {};

    data.forEach((complaint: any) => {
      if (statusCounts[complaint.status] !== undefined) {
        statusCounts[complaint.status]++;
      }
      if (complaint.subTasks && Array.isArray(complaint.subTasks)) {
        totalTickets += complaint.subTasks.length;
        complaint.subTasks.forEach((st: any) => {
          if (ticketStatusCounts[st.status] !== undefined) {
            ticketStatusCounts[st.status]++;
          }

          // Attach repair detail to sub-task & count stats
          if (st.repair_request_id) {
            totalRepairRequests++;
            const detail = repairDetailsMap.get(st.id);
            st.repairDetail = detail || null;

            // Count repair statuses
            const repairStatus = detail?.data?.attributes?.status;
            if (repairStatus) {
              const statuses = repairStatus.split(',').map((s: string) => s.trim());
              statuses.forEach((s: string) => {
                repairStatusCounts[s] = (repairStatusCounts[s] || 0) + 1;
              });
            }
          }
        });
      }
    });

    return {
      summary: {
        totalCases,
        caseStatusCounts: statusCounts,
        totalTickets,
        ticketStatusCounts,
        totalRepairRequests,
        repairStatusCounts,
      },
      data,
    };
  }

  // Get complaints where any sub-task is assigned to the given department
  async findBySubTaskDepartment(departmentId: string): Promise<any[]> {
    const data = await this.complaintListRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.complaintJobCatagory', 'complaintJobCatagory')
      .leftJoinAndSelect('complaint.contactChannel', 'contactChannel')
      .leftJoinAndSelect('complaint.businessUnit', 'businessUnit')
      .leftJoinAndSelect('complaint.jobDepartment', 'jobDepartment')
      .leftJoinAndSelect('complaint.user_created', 'user_created')
      .leftJoinAndSelect('complaint.project', 'project')
      .leftJoinAndSelect('complaint.responsible_persons', 'responsible_persons')
      .innerJoinAndSelect('complaint.subTasks', 'subTasks')
      .leftJoinAndSelect('subTasks.department', 'subTaskDepartment')
      .where('subTasks.job_departments_id = :departmentId', { departmentId })
      .orderBy('complaint.created_at', 'DESC')
      .getMany();

    // Process data to add sub-task summary
    return data.map(complaint => {
      const subTaskTags: string[] = [];
      const subTaskDepartmentIds: string[] = [];

      if (complaint.subTasks && Array.isArray(complaint.subTasks)) {
        complaint.subTasks.forEach((st: any) => {
          if (st.tags && Array.isArray(st.tags)) {
            subTaskTags.push(...st.tags);
          }
          if (st.job_departments_id) {
            subTaskDepartmentIds.push(st.job_departments_id);
          }
        });
      }

      return {
        ...complaint,
        subTaskTags: [...new Set(subTaskTags)],
        subTaskDepartmentIds: [...new Set(subTaskDepartmentIds)]
      };
    });
  }
}
