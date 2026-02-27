import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintJobCatagory } from './complaint-job-catagory.entity';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { Repository } from 'typeorm';
import { AbstractService } from 'src/common/abstract.service';

@Injectable()
export class ComplaintJobCatagoryService extends AbstractService {
    constructor(
        @InjectRepository(ComplaintJobCatagory) private readonly complaintJobCatagoryRepository: Repository<ComplaintJobCatagory>
    ) {
        super(complaintJobCatagoryRepository);
    }

  async getAll(): Promise<ComplaintJobCatagory[]> {
    return this.complaintJobCatagoryRepository
      .createQueryBuilder('cat')
      .orderBy('cat.created_at', 'ASC')
      .getMany();
  }

  async paginateJobCatagory(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {

        const take = 10;
        const textfilter = filterData?.textfilter

        const [data, total] = await this.complaintJobCatagoryRepository.findAndCount({

            take,
            skip: (page - 1) * take,
            relations,
            order: {
                created_at: "DESC"
            }
        });

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

  async paginateJobCatagoryList(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {

        const take = 1000000000;
        const textfilter = filterData?.textfilter

        const [data, total] = await this.complaintJobCatagoryRepository.findAndCount({

            take,
            skip: (page - 1) * take,
            relations,
            order: {
                created_at: "DESC"
            }
        });

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
}
