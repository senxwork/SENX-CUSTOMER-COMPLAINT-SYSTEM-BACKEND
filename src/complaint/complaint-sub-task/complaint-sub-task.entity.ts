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
import { ComplaintList } from '../complaint-list/complaint-list.entity';
import { ComplaintSubTaskTransaction } from '../complaint-sub-task-transaction/complaint-sub-task-transaction.entity';
import { Department } from '../departments/department.entity';
import { TicketCategory } from '../ticket-category/ticket-category.entity';
import { TicketSubCategory } from '../ticket-sub-category/ticket-sub-category.entity';

@Entity('complaint-sub-tasks')
export class ComplaintSubTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  ticket_number: string;

  @Column()
  ticket_detail: string;

  @Column({ nullable: true })
  ticket_sub_category: string;

  @ManyToOne(() => TicketSubCategory, (subCategory) => subCategory.subTasks, {
    nullable: true,
  })
  @JoinColumn({ name: 'ticket_sub_category_id' })
  ticketSubCategory: TicketSubCategory;

  @Column({ default: 'open' })
  status: string;

  @Column({ default: false })
  urgent: boolean;

  @Column({ nullable: true })
  is_processed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @ManyToOne(() => ComplaintList, (complaint) => complaint.subTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'complaint_list_id' })
  parent: ComplaintList;

  @OneToMany(
    () => ComplaintSubTaskTransaction,
    (transaction) => transaction.subTask,
    { eager: false },
  )
  subTaskTransactions: ComplaintSubTaskTransaction[];

  @ManyToOne(() => Department, (department) => department.subTasks, {
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => TicketCategory, (category) => category.subTasks, {
    nullable: true,
  })
  @JoinColumn({ name: 'ticket_category_id' })
  ticketCategory: TicketCategory;

  // Repair request data from Smartfy Home API
  @Column({ type: 'int', nullable: true })
  repair_request_id: number;

  @Column({ nullable: true })
  repair_request_serial: string;

  @Column({ nullable: true })
  repair_request_description: string;

  @Column({ type: 'timestamp', nullable: true })
  repair_request_created_at: Date;

  // Expense data (ค่าใช้จ่าย)
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  expense_amount: number;

  @Column({ type: 'text', nullable: true })
  expense_description: string;

  @Column({ type: 'timestamp', nullable: true })
  expense_date: Date;

  @Column({ nullable: true })
  expense_recorded_by: string;

  // CCS specific fields
  @Column({ type: 'boolean', nullable: true })
  is_sena: boolean;

  @Column({ type: 'text', nullable: true })
  asset_type: string;

  @Column({ type: 'boolean', nullable: true })
  warranty_status: boolean;

  // Department assignment tracking (for reminder email)
  @Column({ type: 'timestamp', nullable: true })
  department_assigned_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  reminder_sent_at: Date;
}
