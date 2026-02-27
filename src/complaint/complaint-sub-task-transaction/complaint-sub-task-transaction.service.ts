import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintSubTaskTransaction } from './complaint-sub-task-transaction.entity';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';

@Injectable()
export class ComplaintSubTaskTransactionService {
  constructor(
    @InjectRepository(ComplaintSubTaskTransaction)
    private readonly transactionRepository: Repository<ComplaintSubTaskTransaction>,
    @InjectRepository(ComplaintSubTask)
    private readonly subTaskRepository: Repository<ComplaintSubTask>,
  ) {}

  async create(
    subTaskId: string,
    data: { transaction_detail: string; user_created: string },
  ): Promise<ComplaintSubTaskTransaction> {
    const subTask = await this.subTaskRepository.findOne({
      where: { id: subTaskId },
    });
    if (!subTask) {
      throw new Error('Sub-task not found');
    }

    const transaction = this.transactionRepository.create({
      transaction_detail: data.transaction_detail,
      user_created: { user_id: data.user_created } as any,
      subTask: subTask,
    });

    return this.transactionRepository.save(transaction);
  }

  async findBySubTaskId(subTaskId: string): Promise<ComplaintSubTaskTransaction[]> {
    return this.transactionRepository.find({
      where: { subTask: { id: subTaskId } },
      relations: ['user_created', 'attachedFiles'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ComplaintSubTaskTransaction> {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['user_created', 'attachedFiles'],
    });
  }
}
