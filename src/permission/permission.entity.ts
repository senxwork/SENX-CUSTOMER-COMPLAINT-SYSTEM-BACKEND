import { Exclude } from "class-transformer";
import { PermissionCategory } from "src/permission-category/permission-category.entity";
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: number;
    @Column()
    name: string;
    @Column()
    name_config: string;
    @Column()
    no_config: string;
    @Column()
    status: boolean;
     @Column()
    permissionCategoryId:string

   
}
