import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';
import { User } from 'src/user/models/user.entity';
import { ComplaintSubTaskTransectionFile } from '../complaint-sub-task-transection-file/complaint-sub-task-transection-file.entity';

@Entity('complaint-sub-task-transactions')
export class ComplaintSubTaskTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transaction_detail: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  commenter_name: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_created' })
  user_created: User;

  @ManyToOne(() => ComplaintSubTask, (subTask) => subTask.subTaskTransactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_task_id' })
  subTask: ComplaintSubTask;

  @OneToMany(
    () => ComplaintSubTaskTransectionFile,
    (file) => file.subTaskTransaction,
    { eager: false },
  )
  attachedFiles: ComplaintSubTaskTransectionFile[];
}
