import { Module } from '@nestjs/common';
import { ComplaintTransactionAttachedfileService } from './complaint-transaction-attachedfile.service';
import { ComplaintTransactionAttachedfileController } from './complaint-transaction-attachedfile.controller';
import { ComplaintTransactionAttachedFileRepository } from './complaint-transaction-attachedfile.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CommonModule } from 'src/common/common.module';

@Module({
 imports: [
    TypeOrmModule.forFeature([ComplaintTransactionAttachedFileRepository]),MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads/complaint_transaction',
      }),
    }),
    CommonModule
],
  providers: [ComplaintTransactionAttachedfileService],
  controllers: [ComplaintTransactionAttachedfileController]
})
export class ComplaintTransactionAttachedfileModule {}
