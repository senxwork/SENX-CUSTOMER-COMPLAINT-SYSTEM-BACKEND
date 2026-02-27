import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicTicketAccess } from './public-ticket-access.entity';
import { PublicTicketAccessController } from './public-ticket-access.controller';
import { PublicTicketAccessService } from './public-ticket-access.service';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';
import { ComplaintSubTaskTransaction } from '../complaint-sub-task-transaction/complaint-sub-task-transaction.entity';
import { ActivityLogModule } from '../../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PublicTicketAccess,
      ComplaintSubTask,
      ComplaintSubTaskTransaction,
    ]),
    ActivityLogModule,
  ],
  controllers: [PublicTicketAccessController],
  providers: [PublicTicketAccessService],
  exports: [PublicTicketAccessService],
})
export class PublicTicketAccessModule {}
