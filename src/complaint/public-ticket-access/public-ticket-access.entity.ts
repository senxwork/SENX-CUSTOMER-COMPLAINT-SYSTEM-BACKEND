import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';

@Entity('public-ticket-access')
export class PublicTicketAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column()
  contact_name: string;

  @Column()
  contact_email: string;

  @ManyToOne(() => ComplaintSubTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_task_id' })
  subTask: ComplaintSubTask;

  @CreateDateColumn()
  created_at: Date;
}
