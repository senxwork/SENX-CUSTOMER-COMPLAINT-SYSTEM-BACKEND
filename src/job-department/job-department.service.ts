import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { Repository } from 'typeorm';
import { JobDepartment } from './job-department.entity';

@Injectable()
export class JobDepartmentService extends AbstractService {
    constructor(
        @InjectRepository(JobDepartment) private readonly jobDepartmentRepository: Repository<JobDepartment>
    ) {
        super(jobDepartmentRepository);
    }
}

