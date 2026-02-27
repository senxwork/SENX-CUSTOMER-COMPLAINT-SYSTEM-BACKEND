import { Controller, Get } from '@nestjs/common';
import { JobDepartmentService } from './job-department.service';

@Controller('job-department')
export class JobDepartmentController {
constructor(private jobDepartmentService: JobDepartmentService) {
    }
    @Get()
    async all() {
        return this.jobDepartmentService.all();
    }
}
