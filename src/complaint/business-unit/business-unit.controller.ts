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
import { BusinessUnitService } from './business-unit.service';
import { BusinessUnit } from './business-unit.entity';

@Controller('business-unit')
export class BusinessUnitController {
  constructor(private businessUnitService: BusinessUnitService) {}

  @Get()
  get(): Promise<BusinessUnit[]> {
    return this.businessUnitService.getBusinessUnit();
  }

  @Post('filter')
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.businessUnitService.paginateBusinessUnit(body, page, []);
  }

  @Post('list')
  async allList(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.businessUnitService.paginateBusinessUnitList(body, page, []);
  }

  @Post()
  async create(@Body() body: any) {
    return this.businessUnitService.create({
      ...body,
    });
  }

  @Put(':id')
  async edit(@Body() body: any, @Param('id') id: string) {
    return this.businessUnitService.update(id, {
      bu_name: body.bu_name,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.businessUnitService.delete(id);
  }
}
