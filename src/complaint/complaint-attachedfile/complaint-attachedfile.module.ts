import { Module } from '@nestjs/common';
import { ComplaintAttachedfileService } from './complaint-attachedfile.service';
import { ComplaintAttachedfileController } from './complaint-attachedfile.controller';
import { ComplaintAttachedFile } from './complaint-attachedfile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

@Module({
 imports: [
    TypeOrmModule.forFeature([ComplaintAttachedFile]),
    CommonModule
],
  providers: [ComplaintAttachedfileService],
  controllers: [ComplaintAttachedfileController]
})
export class ComplaintAttachedfileModule {}
