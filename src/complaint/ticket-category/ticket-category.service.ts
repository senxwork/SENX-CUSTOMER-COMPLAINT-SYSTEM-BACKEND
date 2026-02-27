import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { TicketCategory } from './ticket-category.entity';

@Injectable()
export class TicketCategoryService extends AbstractService {
  constructor(
    @InjectRepository(TicketCategory)
    private readonly ticketCategoryRepository: Repository<TicketCategory>,
  ) {
    super(ticketCategoryRepository);
  }

  async findAll(): Promise<TicketCategory[]> {
    return this.ticketCategoryRepository.find({
      order: { category_name: 'ASC' },
    });
  }

  async deleteById(id: string): Promise<any> {
    return this.ticketCategoryRepository.delete(id);
  }
}
