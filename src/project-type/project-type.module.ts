import { Module } from '@nestjs/common';
import { ProjectTypeService } from './project-type.service';
import { ProjectTypeController } from './project-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ProjectType } from './project-type.entiry';

@Module({
   imports: [
    TypeOrmModule.forFeature([ProjectType]),
    CommonModule
],
  providers: [ProjectTypeService],
  controllers: [ProjectTypeController]
})
export class ProjectTypeModule {}
