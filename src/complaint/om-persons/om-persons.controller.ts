import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OmPersons } from './om-persons.entity';
import { OmPersonsService } from './om-persons.service';

@Controller('om-persons')
export class OmPersonsController  {
constructor(private omPersonsService: OmPersonsService) {}

  @Get()
  get(): Promise<OmPersons[]> {
    return this.omPersonsService.getomPersons();
  }

  @Post('filter')
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.omPersonsService.paginateomPersons(body, page, []);
  }

  @Post('list')
  async allList(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.omPersonsService.paginateomPersonsList(body, page, []);
  }

  @Post()
  async create(@Body() body: any) {
    return this.omPersonsService.create({
      ...body,
    });
  }

  @Put(':id')
  async edit(@Body() body: any, @Param('id') id: string) {
    return this.omPersonsService.update(id, {
      om_name: body.om_name,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.omPersonsService.delete(id);
  }
}
