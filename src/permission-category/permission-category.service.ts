import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { PermissionCategory } from './permission-category.entity';
import { AbstractService } from 'src/common/abstract.service';

@Injectable()
export class PermissionCategoryService extends AbstractService{
 constructor(
        @InjectRepository(PermissionCategory) private readonly permissionCategoryRepository: Repository<PermissionCategory>
    ) {
        super(permissionCategoryRepository);
    }}
