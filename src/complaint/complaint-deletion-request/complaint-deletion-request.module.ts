import { ComplaintRequestDelete } from './requestDelete.entity';
import { Module } from '@nestjs/common';
import { ComplaintDeletionRequestService } from './complaint-deletion-request.service';
import { ComplaintDeletionRequestController } from './complaint-deletion-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [
        TypeOrmModule.forFeature([ComplaintRequestDelete]),
    ],
  providers: [ComplaintDeletionRequestService],
  controllers: [ComplaintDeletionRequestController]
})
export class ComplaintDeletionRequestModule {}
