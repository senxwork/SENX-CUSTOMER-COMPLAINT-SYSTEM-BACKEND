import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ComplaintJobCatagoryService } from './complaint-job-catagory.service';
import { ComplaintJobCatagory } from './complaint-job-catagory.entity';

@Controller('complaint-job-catagory')
export class ComplaintJobCatagoryController {
  constructor(private complaintJobCatagoryService: ComplaintJobCatagoryService) {}

  @Get()
  getAll(): Promise<ComplaintJobCatagory[]> {
    return this.complaintJobCatagoryService.getAll();
  }

  @Post('filter')
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.complaintJobCatagoryService.paginateJobCatagory(body, page, []);
  }

 @Post('list')
  async allList(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.complaintJobCatagoryService.paginateJobCatagoryList(body, page, []);
  }

  @Post()
  async create(@Body() body: any) {
    return this.complaintJobCatagoryService.create({
      catagory_name: body.catagory_name,
    });
  }

  @Put(':id')
  async edit(@Body() body: any, @Param('id') id: string) {
    return this.complaintJobCatagoryService.update(id, {
      catagory_name: body.catagory_name,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.complaintJobCatagoryService.delete(id);
  }
}
