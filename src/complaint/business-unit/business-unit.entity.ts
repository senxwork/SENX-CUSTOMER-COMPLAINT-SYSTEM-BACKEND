import { Exclude } from 'class-transformer';
import { ComplaintList } from 'src/complaint/complaint-list/complaint-list.entity';
import { JobDepartment } from 'src/job-department/job-department.entity';
import { PermissionCategory } from 'src/permission-category/permission-category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('business-units')
export class BusinessUnit{
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  bu_name: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @OneToMany(
    () => ComplaintList,
    (complaintList) => complaintList.businessUnit,
  )
  complaintList: ComplaintList;

}

