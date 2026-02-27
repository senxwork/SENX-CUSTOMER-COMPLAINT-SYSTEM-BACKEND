import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProjectDto } from './dto/create.project.dto';
import { GetProjectFillterDto } from './dto/get-project.dto';
import { Project } from './project.entity';
import { ProjectRepository } from './project.repository';
import { PaginatedResult } from 'src/common/paginated-result.interface';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectRepository)
    private projectRepository: ProjectRepository,
  ) { }
 async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      return this.projectRepository.createProject(createProjectDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async getProject(filterDto: GetProjectFillterDto): Promise<Project[]> {

    const found = await this.projectRepository.find({
      order: { project_name_th: 'ASC' }
    });
    if (!found) {
      throw new NotFoundException(`Data Is not found`);
    }
    return found;
  }

  async paginate(page = 1, relations = []): Promise<PaginatedResult> {
    const take = 1000000000;

    const [data, total] = await this.projectRepository.findAndCount({
      take,
      skip: (page - 1) * take,
      relations,
      order: {
        created_at: "DESC"
      }




    });

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take)
      }
    }
  }
   async paginateProject(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {
     
    const take = 7;
     const textfilter = filterData.textfilter
  
    const [data, total] = await this.projectRepository.findAndCount({

      take,
      skip: (page - 1) * take,
      relations,
      order: {
        created_at: "DESC"
      }




    });
    
        if (textfilter) {

            const filteredData = data.filter(item => {
                for (const field in item) {
                    if (typeof item[field] === 'string' && item[field].includes(textfilter)) {
                        return true;
                    }
                }

                return false;
            });

            return {
                data: filteredData,
                meta: {
                    total,
                    page,
                    last_page: Math.ceil(total / take)
                }
            };
        }
        if (!textfilter) {

            return {
                data: data,
                meta: {
                    total,
                    page,
                    last_page: Math.ceil(total / take)
                }
            };
        }

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take)
      }
    }
  }

  async getProjectByid(id: any): Promise<Project> {
    const found = await this.projectRepository.findOne(id);
    if (!found) {
      throw new NotFoundException(`Floor with ID "${id}" not found`);
    }
    return found;
  }

  async findByProjectId(projectId: string): Promise<Project> {
    const found = await this.projectRepository.findOne({ where: { project_id: projectId } });
    return found;
  }

  async updateProject(id: string, data:any): Promise<any> {
  
    return this.projectRepository.update(id, data)
  }
}
