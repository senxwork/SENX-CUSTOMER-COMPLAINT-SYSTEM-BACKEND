
import { Exclude } from "class-transformer";
import { Project } from "src/project/project.entity";
import { User } from "src/user/models/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity('project-type')
export class ProjectType {
  @PrimaryGeneratedColumn('uuid')
  project_type_id: string;
  @Column()
  project_type_name: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;


}