import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketSubCategory } from './ticket-sub-category.entity';
import { TicketSubCategoryController } from './ticket-sub-category.controller';
import { TicketSubCategoryService } from './ticket-sub-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketSubCategory])],
  controllers: [TicketSubCategoryController],
  providers: [TicketSubCategoryService],
  exports: [TicketSubCategoryService],
})
export class TicketSubCategoryModule {}
