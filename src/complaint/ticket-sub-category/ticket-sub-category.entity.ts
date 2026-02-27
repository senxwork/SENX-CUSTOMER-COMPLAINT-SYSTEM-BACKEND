import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';

@Entity('ticket-sub-categories')
export class TicketSubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sub_category_name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ComplaintSubTask, (subTask) => subTask.ticketSubCategory)
  subTasks: ComplaintSubTask[];
}
