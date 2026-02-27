import { Exclude } from 'class-transformer';
import { ComplaintList } from 'src/complaint/complaint-list/complaint-list.entity';
import { PermissionCategory } from 'src/permission-category/permission-category.entity';
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
import { ComplaintTransactionAttachedFile } from '../complaint-transaction-attachedfile/complaint-transaction-attachedfile.entity';
import { User } from 'src/user/models/user.entity';
import { ComplaintSubTask } from '../complaint-sub-task/complaint-sub-task.entity';

@Entity('complaint-transactions')
export class ComplaintTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  complaint_transaction_detail: string;
  @Column()
  complaintListComplaintId: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_created' })
  user_created: User;

  @ManyToOne(
    (_type) => ComplaintList,
    (complaintList) => complaintList.complaintTransaction,
    { eager: false, nullable: true },
  )
  @Exclude({ toPlainOnly: true })
  complaintList: ComplaintList;

  @ManyToOne(() => ComplaintSubTask, (subTask) => subTask.subTaskTransactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  subTask: ComplaintSubTask;


  @OneToMany(
    (_type) => ComplaintTransactionAttachedFile,
    (complaintTransactionAttachedFile) =>
      complaintTransactionAttachedFile.complaintTransaction,
    {
      eager: false,
    },
  )
  complaintTransactionAttachedFile: ComplaintTransactionAttachedFile[];
}
