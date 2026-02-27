import { Module } from '@nestjs/common';
import { ProjectTypeCategoryController } from './project-type-category.controller';
import { ProjectTypeCategoryService } from './project-type-category.service';

@Module({
  controllers: [ProjectTypeCategoryController],
  providers: [ProjectTypeCategoryService]
})
export class ProjectTypeCategoryModule {}
