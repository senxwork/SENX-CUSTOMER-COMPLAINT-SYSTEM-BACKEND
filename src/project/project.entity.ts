import { Exclude } from 'class-transformer';
import { User } from 'src/user/models/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  project_id: string;
  @Column({ nullable: true })
  project_name_th: string;
  @Column({ default: true })
  project_status: boolean;
  @Column({ nullable: true })
  project_email: string;
  @Column({ nullable: true })
  project_type: string;
  @Column({ default: false })
  is_managed: boolean;
  @Column({ default: false })
  is_sena: boolean;
  @Column({ nullable: true })
  remark: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
