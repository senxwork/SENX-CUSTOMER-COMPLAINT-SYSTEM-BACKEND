import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintSubTask } from './complaint-sub-task.entity';
import { ComplaintSubTaskController } from './complaint-sub-task.controller';
import { ComplaintSubTaskService } from './complaint-sub-task.service';
import { TicketReminderService } from './ticket-reminder.service';
import { Department } from '../departments/department.entity';
import { ComplaintList } from '../complaint-list/complaint-list.entity';
import { PublicTicketAccessModule } from '../public-ticket-access/public-ticket-access.module';
import { SystemSettingsModule } from '../../system-settings/system-settings.module';
import { ActivityLogModule } from '../../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintSubTask, Department, ComplaintList]),
    HttpModule,
    PublicTicketAccessModule,
    SystemSettingsModule,
    ActivityLogModule,
  ],
  controllers: [ComplaintSubTaskController],
  providers: [ComplaintSubTaskService, TicketReminderService],
  exports: [ComplaintSubTaskService],
})
export class ComplaintSubTaskModule {}
