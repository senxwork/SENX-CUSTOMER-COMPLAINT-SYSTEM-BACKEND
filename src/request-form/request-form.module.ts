import { Module } from '@nestjs/common';
import { RequestFormService } from './request-form.service';
import { RequestFormController } from './request-form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { RequestForm } from './request-form.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestForm]),
    CommonModule
],
  providers: [RequestFormService],
  controllers: [RequestFormController]
})
export class RequestFormModule {}
