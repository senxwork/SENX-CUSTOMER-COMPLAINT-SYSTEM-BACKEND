import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ComplaintSubTaskTransaction } from '../complaint-sub-task-transaction/complaint-sub-task-transaction.entity';

@Entity('complaint-sub-task-transection-files')
export class ComplaintSubTaskTransectionFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  file_name: string;

  @Column({ nullable: true })
  file_type: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(
    () => ComplaintSubTaskTransaction,
    (transaction) => transaction.attachedFiles,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'sub_task_transaction_id' })
  subTaskTransaction: ComplaintSubTaskTransaction;
}
