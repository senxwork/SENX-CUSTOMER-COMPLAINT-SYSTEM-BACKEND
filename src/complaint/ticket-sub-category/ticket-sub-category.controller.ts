import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TicketSubCategoryService } from './ticket-sub-category.service';

@Controller('ticket-sub-category')
export class TicketSubCategoryController {
  constructor(
    private readonly ticketSubCategoryService: TicketSubCategoryService,
  ) {}

  @Get()
  async getAll() {
    return this.ticketSubCategoryService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.ticketSubCategoryService.findOne({ id });
  }

  @Post()
  async create(@Body() body: any) {
    return this.ticketSubCategoryService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    await this.ticketSubCategoryService.update(id, body);
    return this.ticketSubCategoryService.findOne({ id });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ticketSubCategoryService.deleteById(id);
  }
}
