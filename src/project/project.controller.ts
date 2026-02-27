import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateProjectDto } from './dto/create.project.dto';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

import { UpdateProjectDto } from './dto/ีupdate.project.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService,) { }
  @Post('/create')
  public async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<any> {
    try {
      const resdata = await this.projectService.createProject({
        ...createProjectDto
      });

      return resdata

    } catch (error) {
        console.log(error)
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get()
  async all(@Query('page') page = 1,) {
    return this.projectService.paginate(page);
  }
  @Post('list')
  async allProject(@Body() body: any, @Query('page') page = 1) {

    return this.projectService.paginateProject(body, page);
  }
  @Get(':id')
  getFloorByID(@Param('id') id: string,): Promise<Project> {
    return this.projectService.getProjectByid(id);
  }

  @Put('update/:id')
  public async updateProject(
    @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {


    try {
      return this.projectService.updateProject(id, updateProjectDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Please check data and try again',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  @UseInterceptors(
    FileInterceptor('file', {

      storage: diskStorage({
        destination: './uploads/project_image',
        filename: function (req, file, cb) {
          var uuid = require('uuid');
          let extArray = file.mimetype.split("/");
          let extension = extArray[extArray.length - 1];
          cb(null, 'project_image' + '-' + uuid.v4() + '.' + extension);
        },
      }),
    }),
  )
  @Put('/file/:id')
  ImageProfileUser(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<string> {
    const filename = file.filename.toString()
    return this.projectService.updateProject(id, { project_logo_image: filename });
  }
  @Get('/file/:imgpath')
  GetImageProfileUser(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/project_image' });

  }

}
