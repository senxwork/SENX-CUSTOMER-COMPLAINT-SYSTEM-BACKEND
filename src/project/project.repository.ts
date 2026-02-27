import { EntityRepository, Repository } from "typeorm";
import { CreateProjectDto } from "./dto/create.project.dto";
import { Project } from "./project.entity";

@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {
   
  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
                  
    const { project_name_th,
     project_email ,remark
    } = createProjectDto;
    const project = this.create({
      project_name_th,
      project_email,   
      remark,
    });
    await this.save(project);
    return project;
  }

}
