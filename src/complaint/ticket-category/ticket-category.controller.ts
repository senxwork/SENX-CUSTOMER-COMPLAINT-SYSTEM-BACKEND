import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TicketCategoryService } from './ticket-category.service';

@Controller('ticket-category')
export class TicketCategoryController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Get()
  async getAll() {
    return this.ticketCategoryService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.ticketCategoryService.findOne({ id });
  }

  @Post()
  async create(@Body() body: any) {
    return this.ticketCategoryService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    await this.ticketCategoryService.update(id, body);
    return this.ticketCategoryService.findOne({ id });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ticketCategoryService.deleteById(id);
  }
}
