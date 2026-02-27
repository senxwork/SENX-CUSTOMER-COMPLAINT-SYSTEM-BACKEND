import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ContactChannelService } from './contact-channel.service';
import { ContactChannel } from './contact-channel.entity';

@Controller('contact-channel')
export class ContactChannelController {
constructor(private contactChannelService: ContactChannelService) {}

  @Get()
  getFollowupJobCatagor(
  ): Promise<ContactChannel[]> {
    return this.contactChannelService.getFollowupContactChannel(
    );
  }

  @Post('filter')
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.contactChannelService.paginateContactChannel(body, page, [
    ]);
  }

 @Post('list')
  async allList(@Body() body: any, @Query('page') page = 1) {
    console.log(body);
    return this.contactChannelService.paginateContactChannelList(body, page, [

    ]);
  }

  @Post()
  async create(@Body() body: any) {
    return this.contactChannelService.create({
      ...body,
    });
  }

  @Put(':id')
  async edit(@Body() body: any, @Param('id') id: string) {
    return this.contactChannelService.update(id, {
      channel_name: body.channel_name
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.contactChannelService.delete(id);
  }

}
