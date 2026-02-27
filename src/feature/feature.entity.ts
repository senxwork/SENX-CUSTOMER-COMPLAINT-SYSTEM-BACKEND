import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Permission} from "../permission/permission.entity";
import { User } from "src/user/models/user.entity";
import { PermissionCategory } from "src/permission-category/permission-category.entity";
import { Exclude } from "class-transformer";

@Entity('features')
export class Feature {
     @PrimaryGeneratedColumn('uuid')
    feature_id: number;

    @Column()
    feature_name: string;
    @Column()
    tab_config:number

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'feature_users',
    joinColumn: { name: 'feature_id', referencedColumnName: 'feature_id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'user_id' }
  })
  users: User[];

  @OneToMany((_type) => PermissionCategory, (permissionCategory) => permissionCategory.features, { eager: false })
    @Exclude({ toPlainOnly: true })
    permissionCategorys: PermissionCategory[];
}
