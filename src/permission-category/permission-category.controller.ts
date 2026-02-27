import { Controller, Get } from '@nestjs/common';
import { PermissionCategoryService } from './permission-category.service';

@Controller('permission-category')
export class PermissionCategoryController {
    constructor(private permissionCategoryService: PermissionCategoryService) {
    }

    @Get()
    async all() {
        return this.permissionCategoryService.all();
    }
}


