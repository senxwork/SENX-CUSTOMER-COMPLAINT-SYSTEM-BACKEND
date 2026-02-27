import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { ProjectType } from './project-type.entiry';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectTypeService extends AbstractService{
        constructor(
            @InjectRepository(ProjectType) private readonly projectTypeRepository: Repository<ProjectType>
        ) {
            super(projectTypeRepository);
        }
}
