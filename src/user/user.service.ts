import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./models/user.entity";
import { Repository } from "typeorm";
import { AbstractService } from "../common/abstract.service";
import { PaginatedResult } from "../common/paginated-result.interface";

@Injectable()
export class UserService extends AbstractService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
        super(userRepository);
    }

    async paginate(page = 1, relations = []): Promise<PaginatedResult> {
        const { data, meta } = await super.paginate(page, relations);

        return {
            data: data.map(user => {
                const { password, ...data } = user;
                return data;
            }),
            meta
        }
    }
    async paginateUser(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {
        const take = 10;
        const first_name_last_name = filterData?.first_name_last_name;
        const email = filterData?.email;
        const role = filterData?.role;
        const active = filterData?.active;

        const queryBuilder = this.repository.createQueryBuilder('users')
            .leftJoinAndSelect('users.role', 'role')
            .leftJoinAndSelect('users.jobDepartment', 'jobDepartment')
            .orderBy('users.created_at', 'DESC');

        if (first_name_last_name) {
            queryBuilder.andWhere('users.first_name_last_name LIKE :name', { name: `%${first_name_last_name}%` });
        }

        if (email) {
            queryBuilder.andWhere('users.email LIKE :email', { email: `%${email}%` });
        }

        if (role) {
            queryBuilder.andWhere('role.id = :role', { role });
        }

        if (active !== undefined && active !== null) {
            queryBuilder.andWhere('users.active = :active', { active });
        }

        const [data, total] = await queryBuilder
            .take(take)
            .skip((page - 1) * take)
            .getManyAndCount();

        return {
            data: data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / take)
            }
        };
    }

    async paginateUserFilterByRole(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {
        console.log(filterData)
        const take = 10000000;
        const textfilter = filterData?.textfilter
        const active = true
        const role = ['3232b801-bec4-498f-a052-660b15477952','e2b7255f-c8c7-4bda-918e-f3a790dbc6a6','fbc41fb0-e213-41fb-a855-29a93b1b97fa','795d2943-25e7-11ee-9cb8-f02f74a20364']
        const project = filterData.project
        const queryBuilder = this.repository.createQueryBuilder('users')
            .leftJoinAndSelect('users.role', 'role')
            .orderBy('users.created_at', 'DESC')
        queryBuilder.andWhere(`users.active = :active`, { active });
     if (project !== undefined) {

            queryBuilder.andWhere('projects.id = :project', { project });
        }
         if (role !== undefined && (Array.isArray(role) ? role.some(item => item !== "") : role !== "")) {

            queryBuilder.andWhere('role.id IN (:...role)', { role });
        }


        const [data, total] = await queryBuilder.take(take).skip((page - 1) * take).getManyAndCount();



        if (textfilter) {

            const filteredData = data.filter(item => {
                for (const field in item) {
                    if (typeof item[field] === 'string' && item[field].includes(textfilter)) {
                        return true;
                    }
                }

                return false;
            });

            return {
                data: filteredData,
                meta: {
                    total,
                    page,
                    last_page: Math.ceil(total / take)
                }
            };
        }
        if (!textfilter) {

            return {
                data: data,
                meta: {
                    total,
                    page,
                    last_page: Math.ceil(total / take)
                }
            };
        }

        return {
            data: data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / take)
            }
        }
    }

      async paginateUserFilterByDepartment (jobDepartment: any): Promise<any> {
            console.log(jobDepartment.job_departments_id)
        return this.repository.find({
            where: { jobDepartment: jobDepartment.job_departments_id },
            order: { created_at: 'DESC' },
            relations: ['jobDepartment',]

        })
    }

    async findOneUser(relations = []): Promise<any> {
        return this.repository.find({
            where: { role: '795d2943-25e7-11ee-9cb8-f02f74a20398' },
            order: { created_at: 'DESC' },
            relations: ['role',]

        })

    }
     async findOneUserProcurementApproved(relations = []): Promise<any> {
        return this.repository.find({
            where: { role: '795d2943-25e7-11ee-9cb8-f02f74a20398',approved_permission:true },
            order: { created_at: 'DESC' },
            relations: ['role',]

        })

    }



   

}
