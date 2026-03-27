import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintSubTaskTransactionService } from './complaint-sub-task-transaction.service';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';
import { ActivityLogService } from '../../activity-log/activity-log.service';

@Controller('complaint-sub-task-transaction')
export class ComplaintSubTaskTransactionController {
  constructor(
    private readonly transactionService: ComplaintSubTaskTransactionService,
    @InjectRepository(ComplaintSubTask)
    private readonly subTaskRepository: Repository<ComplaintSubTask>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post('create/:subTaskId')
  async create(
    @Param('subTaskId') subTaskId: string,
    @Body() body: { transaction_detail: string; user_created: string; performed_by?: string },
  ) {
    const result = await this.transactionService.create(subTaskId, body);

    // ดึง ticket_number สำหรับ Activity Log
    const subTask = await this.subTaskRepository.findOne({ where: { id: subTaskId } });

    // Activity Log
    await this.activityLogService.log({
      sub_task_id: subTaskId,
      action_type: 'ADD_TICKET_COMMENT',
      action_detail: body.transaction_detail,
      performed_by: body.performed_by || null,
      ref_number: subTask?.ticket_number || null,
    });

    return result;
  }

  @Get('by-sub-task/:subTaskId')
  async getBySubTaskId(@Param('subTaskId') subTaskId: string) {
    return this.transactionService.findBySubTaskId(subTaskId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }
}
