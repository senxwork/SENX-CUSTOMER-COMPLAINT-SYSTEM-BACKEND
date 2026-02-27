import { Module } from '@nestjs/common';
import { ComplaintJobCatagoryService } from './complaint-job-catagory.service';
import { ComplaintJobCatagoryController } from './complaint-job-catagory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ComplaintJobCatagory } from './complaint-job-catagory.entity';


@Module({
imports: [TypeOrmModule.forFeature([ComplaintJobCatagory]
),CommonModule],
  providers: [ComplaintJobCatagoryService],
  controllers: [ComplaintJobCatagoryController]
})
export class ComplaintJobCatagoryModule {}
