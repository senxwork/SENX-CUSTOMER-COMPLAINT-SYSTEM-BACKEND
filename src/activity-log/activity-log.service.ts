import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) {}

  async log(data: {
    complaint_id?: string;
    sub_task_id?: string;
    action_type: string;
    action_detail?: string;
    performed_by?: string;
    ref_number?: string;
    metadata?: any;
  }): Promise<ActivityLog> {
    try {
      const entry = this.repo.create(data);
      return await this.repo.save(entry);
    } catch (error) {
      this.logger.error(`Failed to save activity log: ${error.message}`);
      return null;
    }
  }

  async findByComplaint(complaintId: string): Promise<ActivityLog[]> {
    return this.repo.find({
      where: [
        { complaint_id: complaintId },
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findByComplaintWithSubTasks(complaintId: string, subTaskIds: string[]): Promise<ActivityLog[]> {
    const qb = this.repo.createQueryBuilder('log');

    if (subTaskIds.length > 0) {
      qb.where('log.complaint_id = :complaintId', { complaintId })
        .orWhere('log.sub_task_id IN (:...subTaskIds)', { subTaskIds });
    } else {
      qb.where('log.complaint_id = :complaintId', { complaintId });
    }

    return qb.orderBy('log.created_at', 'DESC').getMany();
  }
}
