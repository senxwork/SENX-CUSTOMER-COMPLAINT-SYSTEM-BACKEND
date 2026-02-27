import { Module } from '@nestjs/common';
import { JobDepartmentController } from './job-department.controller';
import { JobDepartmentService } from './job-department.service';
import { JobDepartment } from './job-department.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

@Module({
   imports: [
    TypeOrmModule.forFeature([JobDepartment]),
    CommonModule
],
  controllers: [JobDepartmentController],
  providers: [JobDepartmentService]
})
export class JobDepartmentModule {}
