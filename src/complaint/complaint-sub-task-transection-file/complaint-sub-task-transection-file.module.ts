import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintSubTaskTransectionFile } from './complaint-sub-task-transection-file.entity';
import { ComplaintSubTaskTransectionFileController } from './complaint-sub-task-transection-file.controller';
import { ComplaintSubTaskTransectionFileService } from './complaint-sub-task-transection-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintSubTaskTransectionFile])],
  controllers: [ComplaintSubTaskTransectionFileController],
  providers: [ComplaintSubTaskTransectionFileService],
  exports: [ComplaintSubTaskTransectionFileService],
})
export class ComplaintSubTaskTransectionFileModule {}
