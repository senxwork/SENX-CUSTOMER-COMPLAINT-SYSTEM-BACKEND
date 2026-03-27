import { Module, forwardRef } from '@nestjs/common';
import { ComplaintListService } from './complaint-list.service';
import { ComplaintListController } from './complaint-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ComplaintList } from './complaint-list.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/models/user.entity';
import { ProjectService } from 'src/project/project.service';
import { ProjectRepository } from 'src/project/project.repository';
import { ActivityLogModule } from '../../activity-log/activity-log.module';
import { ComplaintSubTaskModule } from '../complaint-sub-task/complaint-sub-task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintList, User, ProjectRepository]),
    CommonModule,
    ActivityLogModule,
    forwardRef(() => ComplaintSubTaskModule),
],
  providers: [ComplaintListService, UserService, ProjectService],
  controllers: [ComplaintListController]
})
export class ComplaintListModule {}
