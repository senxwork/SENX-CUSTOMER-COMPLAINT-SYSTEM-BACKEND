import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  department_name: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'text', nullable: true })
  responsibility: string;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  contacts: { name: string; email: string; phone?: string; is_primary?: boolean }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ComplaintSubTask, (subTask) => subTask.department)
  subTasks: ComplaintSubTask[];
}
