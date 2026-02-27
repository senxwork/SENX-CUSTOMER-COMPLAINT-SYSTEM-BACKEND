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
import { Department } from './department.entity';
import { DepartmentService } from './department.service';

@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Get()
  get(): Promise<Department[]> {
    return this.departmentService.getDepartments();
  }

  @Post('filter')
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.departmentService.paginateDepartments(body, page, []);
  }

  @Post('list')
  async allList(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.departmentService.paginateDepartmentsList(body, page, []);
  }

  @Post()
  async create(@Body() body: any) {
    return this.departmentService.create({
      ...body,
    });
  }

  @Put(':id')
  async edit(@Body() body: any, @Param('id') id: string) {
    return this.departmentService.update(id, {
      department_name: body.department_name,
      company: body.company,
      responsibility: body.responsibility || '',
      contacts: body.contacts || [],
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.departmentService.delete(id);
  }
}
