import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { BusinessUnit } from './business-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BusinessUnitService extends AbstractService {
    constructor(
        @InjectRepository(BusinessUnit) private readonly businessUnitRepository: Repository<BusinessUnit>
    ) {
        super(businessUnitRepository);
    }
 async getBusinessUnit(): Promise<BusinessUnit[]> {
   
    const found = await this.businessUnitRepository.find({
      order:{created_at: 'ASC'}
    });
    if (!found) {
      throw new NotFoundException(`Data Is not found`);
    }
    return found;
  }

  async paginateBusinessUnit(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {

        const take = 10;
        const textfilter = filterData?.textfilter

        const [data, total] = await this.businessUnitRepository.findAndCount({

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

  async paginateBusinessUnitList(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {

        const take = 1000000000;
        const textfilter = filterData?.textfilter

        const [data, total] = await this.businessUnitRepository.findAndCount({

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
