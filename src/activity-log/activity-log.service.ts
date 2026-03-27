import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { NotificationRead } from './notification-read.entity';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
    @InjectRepository(NotificationRead)
    private readonly notifReadRepo: Repository<NotificationRead>,
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

  async findByDepartment(departmentId: string, userId: string, limit = 30): Promise<any[]> {
    const qb = this.repo.createQueryBuilder('al')
      .innerJoin(
        'complaint-sub-tasks', 'cst',
        '(cst.complaint_list_id = al.complaint_id OR cst.id = al.sub_task_id)',
      )
      .leftJoin(
        'notification_reads', 'nr',
        'nr.activity_log_id = al.id AND nr.user_id = :userId',
        { userId },
      )
      .addSelect('CASE WHEN nr.id IS NOT NULL THEN true ELSE false END', 'is_read')
      .addSelect('cst.complaint_list_id', 'nav_complaint_id')
      .addSelect('cst.id', 'nav_sub_task_id')
      .where('cst.department_id = :departmentId', { departmentId })
      .groupBy('al.id, nr.id, cst.complaint_list_id, cst.id')
      .orderBy('al.created_at', 'DESC')
      .limit(limit);

    const raw = await qb.getRawAndEntities();

    return raw.entities.map((entity, i) => ({
      ...entity,
      is_read: raw.raw[i]?.is_read === true || raw.raw[i]?.is_read === 'true',
      nav_complaint_id: raw.raw[i]?.nav_complaint_id || entity.complaint_id,
      nav_sub_task_id: raw.raw[i]?.nav_sub_task_id || entity.sub_task_id,
    }));
  }

  async countUnread(departmentId: string, userId: string): Promise<number> {
    const result = await this.repo.createQueryBuilder('al')
      .innerJoin(
        'complaint-sub-tasks', 'cst',
        '(cst.complaint_list_id = al.complaint_id OR cst.id = al.sub_task_id)',
      )
      .leftJoin(
        'notification_reads', 'nr',
        'nr.activity_log_id = al.id AND nr.user_id = :userId',
        { userId },
      )
      .where('cst.department_id = :departmentId', { departmentId })
      .andWhere('nr.id IS NULL')
      .select('COUNT(DISTINCT al.id)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  /**
   * นับ unread activity logs ต่อ ticket (sub_task_id) สำหรับหน่วยงาน
   * คืนค่า { [sub_task_id]: unreadCount }
   */
  async countUnreadByTickets(departmentId: string, ticketIds: string[]): Promise<Record<string, number>> {
    if (!ticketIds?.length || !departmentId) return {};

    const results = await this.repo.createQueryBuilder('al')
      .leftJoin(
        'notification_reads', 'nr',
        'nr.activity_log_id = al.id AND nr.department_id = :departmentId',
        { departmentId },
      )
      .where('al.sub_task_id IN (:...ticketIds)', { ticketIds })
      .andWhere('nr.id IS NULL')
      .select('al.sub_task_id', 'sub_task_id')
      .addSelect('COUNT(al.id)', 'count')
      .groupBy('al.sub_task_id')
      .getRawMany();

    const map: Record<string, number> = {};
    for (const r of results) {
      map[r.sub_task_id] = parseInt(r.count, 10);
    }
    return map;
  }

  /**
   * Mark ทุก activity log ของ ticket นั้นว่าอ่านแล้ว สำหรับหน่วยงาน
   */
  async markTicketAsRead(departmentId: string, ticketId: string, userId?: string): Promise<void> {
    if (!departmentId) return;

    const unreadLogs = await this.repo.createQueryBuilder('al')
      .leftJoin(
        'notification_reads', 'nr',
        'nr.activity_log_id = al.id AND nr.department_id = :departmentId',
        { departmentId },
      )
      .where('al.sub_task_id = :ticketId', { ticketId })
      .andWhere('nr.id IS NULL')
      .select('al.id', 'id')
      .getRawMany();

    const ids = unreadLogs.map((l) => l.id).filter(Boolean);
    if (ids.length > 0) {
      // Insert reads with department_id
      const newReads = ids.map((id) =>
        this.notifReadRepo.create({
          user_id: userId || departmentId,
          activity_log_id: id,
          department_id: departmentId,
        }),
      );
      await this.notifReadRepo.save(newReads);
    }
  }

  async markAsRead(userId: string, activityLogIds: string[]): Promise<void> {
    if (!activityLogIds?.length) return;

    const existing = await this.notifReadRepo.find({
      where: { user_id: userId, activity_log_id: In(activityLogIds) },
    });
    const existingIds = new Set(existing.map((r) => r.activity_log_id));

    const newReads = activityLogIds
      .filter((id) => !existingIds.has(id))
      .map((id) => this.notifReadRepo.create({ user_id: userId, activity_log_id: id }));

    if (newReads.length > 0) {
      await this.notifReadRepo.save(newReads);
    }
  }

  async markAllAsRead(userId: string, departmentId: string): Promise<void> {
    const unreadLogs = await this.repo.createQueryBuilder('al')
      .innerJoin(
        'complaint-sub-tasks', 'cst',
        '(cst.complaint_list_id = al.complaint_id OR cst.id = al.sub_task_id)',
      )
      .leftJoin(
        'notification_reads', 'nr',
        'nr.activity_log_id = al.id AND nr.user_id = :userId',
        { userId },
      )
      .where('cst.department_id = :departmentId', { departmentId })
      .andWhere('nr.id IS NULL')
      .select('DISTINCT al.id', 'id')
      .getRawMany();

    const ids = unreadLogs.map((l) => l.id).filter(Boolean);
    if (ids.length > 0) {
      await this.markAsRead(userId, ids);
    }
  }
}
