import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permission } from "../permission/permission.entity";
import { PermissionCategory } from "src/permission-category/permission-category.entity";
import { StaffType } from "src/staff-type/staff-type.entiry";

@Entity('positions')
export class Position {
    @PrimaryGeneratedColumn('uuid')
    position_id: number;
    @Column()
    position_name: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @ManyToOne(() => StaffType)
    @JoinColumn({ name: 'staff_type_id' })
    staffType: StaffType;


}
