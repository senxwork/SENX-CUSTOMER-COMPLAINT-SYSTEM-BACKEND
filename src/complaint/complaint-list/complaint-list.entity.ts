import { Exclude } from 'class-transformer';
import { PermissionCategory } from 'src/permission-category/permission-category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintTransaction } from '../complaint-transaction/complaint-transaction.entity';
import { User } from 'src/user/models/user.entity';
import { Project } from 'src/project/project.entity';
import { ComplaintJobCatagory } from '../complaint-job-catagory/complaint-job-catagory.entity';
import { JobDepartment } from 'src/job-department/job-department.entity';
import { ComplaintAttachedFile } from '../complaint-attachedfile/complaint-attachedfile.entity';
import { ContactChannel } from '../contact-channel/contact-channel.entity';
import { BusinessUnit } from '../business-unit/business-unit.entity';
import { OmPersons } from '../om-persons/om-persons.entity';

@Entity('complaint-lists')
export class ComplaintList {
  @PrimaryGeneratedColumn('uuid')
  complaint_id: string;
  @Column({ nullable: true, unique: true })
  case_number: string;
  @Column()
  job_detail: string;
  @Column({ nullable: true })
  customer_name: string;
  @Column({ nullable: true })
  house_name: string;
  @Column({ nullable: true })
  telephone: string;
  @Column({ nullable: true })
  email: string;
  @Column({ type: 'simple-json', nullable: true })
  tags: string[];
  @Column()
  status: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @Column({ nullable: true })
  date_job_completed: Date;
  @OneToMany(
    (_type) => ComplaintTransaction,
    (complaintTransaction) => complaintTransaction.complaintList,
    {
      eager: false,
    },
  )
  complaintTransaction: ComplaintTransaction[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_created' })
  user_created: User;

  @ManyToOne(() => Project)
  @JoinColumn()
  project: Project;

  @ManyToOne(() => JobDepartment)
  @JoinColumn({ name: 'jobDepartment' })
  jobDepartment: JobDepartment;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'complaint_user',
    joinColumn: { name: 'complaint_id', referencedColumnName: 'complaint_id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
  })
  responsible_persons: User[];

  @ManyToOne(
    () => ComplaintJobCatagory,
    (complaintJobCatagory) => complaintJobCatagory.complaintList,
  )
  @JoinColumn()
  complaintJobCatagory: ComplaintJobCatagory;

  @ManyToOne(
    () => ContactChannel,
    (contactChannel) => contactChannel.complaintList,
  )
  @JoinColumn()
  contactChannel: ContactChannel;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.complaintList)
  @JoinColumn()
  businessUnit: BusinessUnit;

  @ManyToOne(() => OmPersons, (omPersons) => omPersons.complaintList)
  @JoinColumn()
  omPersons: OmPersons;

  @OneToMany(
    (_type) => ComplaintAttachedFile,
    (complaintAttachedFile) => complaintAttachedFile.complaintList,
    {
      eager: false,
    },
  )
  complaintAttachedFile: ComplaintAttachedFile[];

  @OneToMany('ComplaintSubTask', (subTask: any) => subTask.parent, {
    eager: false,
  })
  subTasks: any[];
}
