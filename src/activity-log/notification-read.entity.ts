import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notification_reads')
export class NotificationRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  activity_log_id: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @CreateDateColumn()
  read_at: Date;
}
