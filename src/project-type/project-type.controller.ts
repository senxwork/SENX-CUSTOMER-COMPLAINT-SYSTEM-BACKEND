import { Controller, Get } from '@nestjs/common';
import { ProjectTypeService } from './project-type.service';

@Controller('project-type')
export class ProjectTypeController {
    constructor(private projectTypeService: ProjectTypeService) {
    }

    @Get()
    async all() {
        return this.projectTypeService.all();
    }
}
