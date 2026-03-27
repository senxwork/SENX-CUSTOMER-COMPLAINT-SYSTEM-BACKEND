import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/role.entity';
import { Project } from 'src/project/project.entity';
import { StaffType } from 'src/staff-type/staff-type.entiry';
import { Feature } from 'src/feature/feature.entity';
import { Position } from 'src/position/position.entity';
import { JobDepartment } from 'src/job-department/job-department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: number;
  @Column()
  first_name_last_name: string;
  @Column({ unique: true })
  username: string;
  @Column({ nullable: true })
  profile_image: string;
  @Column()
  mobile: string;
  @Column()
  email: string;
  @Column({ default: false })
  assign_permission: boolean;
  @Column()
  @Exclude()
  password: string;
  @Column({ type: 'uuid', nullable: true })
  department: string;
  @Column({ default: false })
  line_user_status: boolean;
  @Column({ default: true })
  active: boolean;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => JobDepartment)
  @JoinColumn({ name: 'jobDepartment' })
  jobDepartment: JobDepartment;
}