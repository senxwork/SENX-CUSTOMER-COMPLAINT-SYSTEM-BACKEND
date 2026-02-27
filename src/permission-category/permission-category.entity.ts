import { Feature } from "src/feature/feature.entity";
import { Permission } from "src/permission/permission.entity";
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity('permission_categorys')
export class PermissionCategory {
    @PrimaryGeneratedColumn('uuid')
    id: number;
    @Column()
    name: string;
    @ManyToOne((_type) => Feature, (feature) => feature.permissionCategorys, {
        eager: false,
      })
      features: Feature[];
}
