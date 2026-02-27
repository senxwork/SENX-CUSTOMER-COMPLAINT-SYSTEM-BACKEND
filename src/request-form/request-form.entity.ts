import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/user/models/user.entity";
import { Project } from "src/project/project.entity";

@Entity('request-forms')
export class RequestForm {
  @PrimaryGeneratedColumn('uuid')
  request_id: string;
  @Column({ nullable: true })
  prefix: string;
  @Column({ nullable: false })
  first_name_th: string;
  @Column({ nullable: true })
  last_name_th: string;
  @Column({ nullable: true })
  first_name_en: string;
  @Column({ nullable: true })
  last_name_en: string;
  @Column({ nullable: true })
  telephone: string;
  @Column({ nullable: true })
  email: string;
  @Column({ default: false })
  request_category: string;
  @Column({ type: 'json' })
  request_system: string;
  @Column({ nullable: true })
  remark: string;
  @Column({ default: 'Requested' })
  status: string
  @Column({ nullable: false })
  due_date: string
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @Column({ type: 'json' })
  projects: string;


}
