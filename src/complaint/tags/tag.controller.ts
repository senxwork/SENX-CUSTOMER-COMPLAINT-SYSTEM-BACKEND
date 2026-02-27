import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  getAllTags(): Promise<Tag[]> {
    return this.tagService.getAllTags();
  }

  @Post('filter')
  async allFilter(@Body() body: any, @Query('page') page = 1) {
    return this.tagService.paginateTag(body, page, []);
  }

  @Post('list')
  async allList(@Body() body: any, @Query('page') page = 1) {
    return this.tagService.paginateTagList(body, page, []);
  }

  @Post()
  async create(@Body() body: any) {
    return this.tagService.create({
      ...body,
    });
  }

  @Put(':id')
  async edit(@Body() body: any, @Param('id') id: string) {
    return this.tagService.update(id, {
      tag_name: body.tag_name
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tagService.deleteTag(id);
  }
}
