import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('complaint-request-request')
export class ComplaintRequestDelete {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    complaintJobCatagory: string;
    @Column()
    deletion_request: string;
    @Column()
    project: string;
    @Column()
    status: string
    @Column()
    userReqest: string
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column()
    complaintListComplaintId: string;
    @Column()
    system_name:string
}
