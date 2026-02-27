import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Permission} from "../permission/permission.entity";

@Entity('staff_types')
export class StaffType {
    @PrimaryGeneratedColumn('uuid')
    staff_type_id: number;
    @Column()
    name: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;

   
}
