import { Exclude } from 'class-transformer';
import { ComplaintList } from 'src/complaint/complaint-list/complaint-list.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('complaint-job-catagorys')
export class ComplaintJobCatagory {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  catagory_name: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @OneToMany(
    () => ComplaintList,
    (complaintList) => complaintList.complaintJobCatagory,
  )
  complaintList: ComplaintList;
}

