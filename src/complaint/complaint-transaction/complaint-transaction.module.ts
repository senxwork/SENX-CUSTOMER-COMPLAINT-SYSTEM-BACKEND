import { Module } from '@nestjs/common';
import { ComplaintTransactionService } from './complaint-transaction.service';
import { ComplaintTransactionController } from './complaint-transaction.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintTransactionRepository } from './complaint-transaction.repository';
import { ActivityLogModule } from '../../activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintTransactionRepository]),CommonModule, ActivityLogModule],
  providers: [ComplaintTransactionService],
  controllers: [ComplaintTransactionController]
})
export class ComplaintTransactionModule {}
