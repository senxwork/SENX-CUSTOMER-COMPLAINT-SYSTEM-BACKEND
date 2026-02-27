import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('activity-logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  complaint_id: string;

  @Column({ nullable: true })
  sub_task_id: string;

  @Column()
  action_type: string;

  @Column({ type: 'text', nullable: true })
  action_detail: string;

  @Column({ nullable: true })
  performed_by: string;

  @Column({ nullable: true })
  ref_number: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;
}
