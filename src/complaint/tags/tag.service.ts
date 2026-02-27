import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { Tag } from './tag.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/common/paginated-result.interface';

@Injectable()
export class TagService extends AbstractService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>
  ) {
    super(tagRepository);
  }

  async getAllTags(): Promise<Tag[]> {
    const found = await this.tagRepository.find({
      order: { created_at: 'ASC' }
    });
    if (!found) {
      throw new NotFoundException(`Data Is not found`);
    }
    return found;
  }

  async paginateTag(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {
    const take = 10;
    const textfilter = filterData?.textfilter;

    const [data, total] = await this.tagRepository.findAndCount({
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

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take)
      }
    };
  }

  async paginateTagList(filterData: any, page = 1, relations = []): Promise<PaginatedResult> {
    const take = 1000000000;
    const textfilter = filterData?.textfilter;

    const [data, total] = await this.tagRepository.findAndCount({
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

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take)
      }
    };
  }

  async deleteTag(id: string): Promise<any> {
    return this.tagRepository.delete(id);
  }
}
