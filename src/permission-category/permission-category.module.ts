import { Module } from '@nestjs/common';
import { PermissionCategoryService } from './permission-category.service';
import { PermissionCategoryController } from './permission-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { PermissionCategory } from './permission-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionCategory]),
    CommonModule
],
  providers: [PermissionCategoryService],
  controllers: [PermissionCategoryController]
})
export class PermissionCategoryModule {}
