import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permission } from "../permission/permission.entity";
import { PermissionCategory } from "src/permission-category/permission-category.entity";
import { StaffType } from "src/staff-type/staff-type.entiry";

@Entity('job_departments')
export class JobDepartment {
    @PrimaryGeneratedColumn('uuid')
    job_departments_id: number;
    @Column()
    job_departments_name: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;

}
