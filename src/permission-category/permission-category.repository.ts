/* eslint-disable prettier/prettier */
import { EntityRepository, Repository } from 'typeorm';
import { PermissionCategory } from './permission-category.entity';




@EntityRepository(PermissionCategory)
export class PermissionCategoryRepository extends Repository<PermissionCategory> {

 
  
}
