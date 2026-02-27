import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintSubTaskTransaction } from './complaint-sub-task-transaction.entity';
import { ComplaintSubTaskTransactionController } from './complaint-sub-task-transaction.controller';
import { ComplaintSubTaskTransactionService } from './complaint-sub-task-transaction.service';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';
import { ActivityLogModule } from '../../activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintSubTaskTransaction, ComplaintSubTask]), ActivityLogModule],
  controllers: [ComplaintSubTaskTransactionController],
  providers: [ComplaintSubTaskTransactionService],
  exports: [ComplaintSubTaskTransactionService],
})
export class ComplaintSubTaskTransactionModule {}
