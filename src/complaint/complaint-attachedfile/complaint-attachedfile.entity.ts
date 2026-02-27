
import { Exclude } from "class-transformer";
import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import { ComplaintList } from "../complaint-list/complaint-list.entity";

@Entity('complaint-files')
export class ComplaintAttachedFile {
    @PrimaryGeneratedColumn('uuid')
    file_id: string;
    @Column()
    file_name: string;
    @Column()
    file_type: string;
     @Column()
    originalname: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column()
    complaintListComplaintId:string
    @ManyToOne((_type) => ComplaintList, (complaintList) => complaintList.complaintAttachedFile, { eager: false })
    @Exclude({ toPlainOnly: true })
    complaintList: ComplaintList;

}
