import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { TicketSubCategory } from './ticket-sub-category.entity';

@Injectable()
export class TicketSubCategoryService extends AbstractService {
  constructor(
    @InjectRepository(TicketSubCategory)
    private readonly ticketSubCategoryRepository: Repository<TicketSubCategory>,
  ) {
    super(ticketSubCategoryRepository);
  }

  async findAll(): Promise<TicketSubCategory[]> {
    return this.ticketSubCategoryRepository.find({
      order: { sub_category_name: 'ASC' },
    });
  }

  async deleteById(id: string): Promise<any> {
    return this.ticketSubCategoryRepository.delete(id);
  }
}
