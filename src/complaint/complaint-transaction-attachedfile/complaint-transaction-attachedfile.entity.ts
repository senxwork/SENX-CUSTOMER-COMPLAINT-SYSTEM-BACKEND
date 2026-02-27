
import { Exclude } from "class-transformer";
import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import { ComplaintTransaction } from "../complaint-transaction/complaint-transaction.entity";

@Entity('complaint-transection-files')
export class ComplaintTransactionAttachedFile {
    @PrimaryGeneratedColumn('uuid')
    file_id: string;
    @Column()
    file_name: string;
    @Column()
    file_type: string;

    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column()
    complaintTransactionId:string

    @ManyToOne((_type) => ComplaintTransaction, (complaintTransaction) => complaintTransaction.complaintTransactionAttachedFile, { eager: false })
    @Exclude({ toPlainOnly: true })
    complaintTransaction: ComplaintTransaction;

}
