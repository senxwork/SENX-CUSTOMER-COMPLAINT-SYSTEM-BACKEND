import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicTicketAccess } from './public-ticket-access.entity';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';
import { ComplaintSubTaskTransaction } from '../complaint-sub-task-transaction/complaint-sub-task-transaction.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PublicTicketAccessService {
  constructor(
    @InjectRepository(PublicTicketAccess)
    private readonly accessRepository: Repository<PublicTicketAccess>,
    @InjectRepository(ComplaintSubTask)
    private readonly subTaskRepository: Repository<ComplaintSubTask>,
    @InjectRepository(ComplaintSubTaskTransaction)
    private readonly transactionRepository: Repository<ComplaintSubTaskTransaction>,
  ) {}

  async createAccess(
    subTaskId: string,
    contactName: string,
    contactEmail: string,
  ): Promise<PublicTicketAccess> {
    const subTask = await this.subTaskRepository.findOne({
      where: { id: subTaskId },
    });
    if (!subTask) {
      throw new Error('Sub-task not found');
    }

    // Check if access already exists for this sub-task + email
    const existing = await this.accessRepository.findOne({
      where: {
        subTask: { id: subTaskId },
        contact_email: contactEmail,
      },
    });
    if (existing) {
      // Update name if changed
      existing.contact_name = contactName;
      await this.accessRepository.save(existing);
      return existing;
    }

    const access = this.accessRepository.create({
      token: uuidv4(),
      contact_name: contactName,
      contact_email: contactEmail,
      subTask: subTask,
    });

    return this.accessRepository.save(access);
  }

  async findByToken(token: string): Promise<PublicTicketAccess> {
    return this.accessRepository.findOne({
      where: { token },
      relations: [
        'subTask',
        'subTask.parent',
        'subTask.parent.project',
        'subTask.department',
        'subTask.ticketCategory',
        'subTask.ticketSubCategory',
        'subTask.subTaskTransactions',
        'subTask.subTaskTransactions.user_created',
        'subTask.subTaskTransactions.attachedFiles',
      ],
    });
  }

  async getTicketByToken(token: string) {
    const access = await this.findByToken(token);
    if (!access) {
      return null;
    }

    // Sort transactions by created_at DESC
    if (access.subTask?.subTaskTransactions) {
      access.subTask.subTaskTransactions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return {
      access_id: access.id,
      contact_name: access.contact_name,
      contact_email: access.contact_email,
      ticket: access.subTask,
    };
  }

  async addComment(
    token: string,
    transactionDetail: string,
  ): Promise<ComplaintSubTaskTransaction> {
    const access = await this.accessRepository.findOne({
      where: { token },
      relations: ['subTask'],
    });
    if (!access) {
      throw new Error('Invalid token');
    }

    const transaction = this.transactionRepository.create({
      transaction_detail: transactionDetail,
      commenter_name: access.contact_name,
      subTask: access.subTask,
    });

    return this.transactionRepository.save(transaction);
  }

  async updateStatus(
    token: string,
    status: string,
  ): Promise<ComplaintSubTask> {
    const access = await this.accessRepository.findOne({
      where: { token },
      relations: ['subTask'],
    });
    if (!access) {
      throw new Error('Invalid token');
    }

    // Only allow specific statuses
    const allowedStatuses = ['inprogress', 'completed'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    await this.subTaskRepository.update(access.subTask.id, { status });

    // Add a transaction log for the status change
    const statusLabels = {
      inprogress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น',
    };
    const transaction = this.transactionRepository.create({
      transaction_detail: `เปลี่ยนสถานะเป็น "${statusLabels[status]}"`,
      commenter_name: access.contact_name,
      subTask: access.subTask,
    });
    await this.transactionRepository.save(transaction);

    return this.subTaskRepository.findOne({
      where: { id: access.subTask.id },
    });
  }
}
