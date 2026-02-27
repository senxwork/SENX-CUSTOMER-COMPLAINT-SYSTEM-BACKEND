import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { OmPersons } from './om-persons.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OmPersonsService extends AbstractService {
    constructor(
        @InjectRepository(OmPersons) private readonly omPersonsRepository: Repository<OmPersons>
    ) {
        super(omPersonsRepository);
    }
 async getomPersons(): Promise<OmPersons[]> {
   
    const found = await this.omPersonsRepository.find({
      order:{created_at: 'ASC'}
    });
    if (!found) {
      throw new NotFoundException(`Data Is not found`);
    }
    return found;
  }

  async paginateomPersons(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {

        const take = 10;
        const textfilter = filterData?.textfilter

        const [data, total] = await this.omPersonsRepository.findAndCount({

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

  async paginateomPersonsList(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {

        const take = 1000000000;
        const textfilter = filterData?.textfilter

        const [data, total] = await this.omPersonsRepository.findAndCount({

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
