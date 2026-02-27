import { Project } from '../project/project.entity';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from './paginated-result.interface';

@Injectable()
export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  async all(relations = []): Promise<any[]> {
    return this.repository.find({ relations });
  }

  async paginate(page = 1, relations = []): Promise<PaginatedResult> {
    const take = 10;

    const [data, total] = await this.repository.findAndCount({
      take,
      skip: (page - 1) * take,
      relations,
      order: {
        created_at: 'DESC',
      },
    });

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }
  /*  async paginateByFilter(filterData:any, page = 1, relations = []): Promise<PaginatedResult> {

        const user_id = filterData.responsible_persons
        const project = filterData.project
         const take = 10;
         const [data, total] = await this.repository
             .createQueryBuilder('complaint-lists').take(take).skip((page - 1) * take)
             .leftJoinAndSelect('complaint-lists.complaintImageBefore', 'complaintImageBefore')
             .leftJoinAndSelect('complaint-lists.complaintImageAfter', 'complaintImageAfter')
             .leftJoinAndSelect('complaint-lists.complaintJobCatagory', 'complaintJobCatagory')
             .leftJoinAndSelect('complaint-lists.complaintTransaction', 'complaintTransaction')
             .leftJoinAndSelect('complaint-lists.user_created', 'user_created')
             .leftJoinAndSelect('complaint-lists.project', 'project')
             .leftJoinAndSelect('complaint-lists.complaintTakeTime', 'complaintTakeTime')
             .leftJoinAndSelect('complaintTransaction.complaintTransactionAttachedFile', 'complaintTransactionAttachedFile')
             .innerJoinAndSelect('complaint-lists.responsible_persons', 'responsible_persons')
            if (user_id && user_id.length > 0) {
         queryBuilder.where('responsible_persons.user_id IN (:...user_id)', { user_id });
     }

     if (project_ids && project_ids.length > 0) {
         queryBuilder.andWhere('project.id IN (:...project_ids)', { project_ids });
     }

     const [data, total] = await queryBuilder.take(take).skip((page - 1) * take).getManyAndCount();




             .getManyAndCount();
         return {
             data: data,
             meta: {
                 total,
                 page,
                 last_page: Math.ceil(total / take)
             }
         }
     } */
async paginateByFilter(
  filterData: any,
  page = 1,
  relations = [],
): Promise<PaginatedResult> {
  const responsible_persons = filterData.responsible_persons;
  const project = filterData.project;
  const targetMonth = filterData.targetMonth;
  const textfilter = filterData.textfilter;
  const status = filterData.status;
  const category = filterData.category;
  const jobDepartment = filterData.jobDepartment;
  const user_created = filterData.user_created;

  console.log(filterData);
  const take = 10;

  // สร้าง base query builder
  const baseQueryBuilder = () => this.repository
    .createQueryBuilder('complaint-lists')
    .leftJoinAndSelect('complaint-lists.complaintJobCatagory', 'complaintJobCatagory')
    .leftJoinAndSelect('complaint-lists.contactChannel', 'contactChannel')
    .leftJoinAndSelect('complaint-lists.businessUnit', 'businessUnit')
    .leftJoinAndSelect('complaint-lists.jobDepartment', 'jobDepartment')
    .leftJoinAndSelect('complaint-lists.complaintTransaction', 'complaintTransaction')
    .leftJoinAndSelect('complaint-lists.user_created', 'user_created')
    .leftJoinAndSelect('complaint-lists.project', 'project')
    .leftJoinAndSelect('complaint-lists.complaintAttachedFile', 'complaintAttachedFile')
    .leftJoinAndSelect('complaint-lists.responsible_persons', 'responsible_persons')
    .leftJoinAndSelect('complaint-lists.omPersons', 'omPersons')
    .leftJoinAndSelect('complaintTransaction.complaintTransactionAttachedFile', 'complaintTransactionAttachedFile')
    .orderBy('complaint-lists.created_at', 'DESC');

  // ฟังก์ชันสำหรับใส่ WHERE conditions
  const applyFilters = (queryBuilder: any) => {
    if (
      responsible_persons !== undefined &&
      (Array.isArray(responsible_persons)
        ? responsible_persons.some((item) => item !== '')
        : responsible_persons !== '')
    ) {
      queryBuilder.andWhere(
        'responsible_persons.user_id IN (:...responsible_persons)',
        { responsible_persons },
      );
    }

    if (
      jobDepartment !== undefined &&
      jobDepartment !== '' &&
      jobDepartment !== null
    ) {
      queryBuilder.andWhere(
        'jobDepartment.job_departments_id IN (:jobDepartment)',
        { jobDepartment },
      );
    }

    if (targetMonth) {
      queryBuilder.andWhere(`MONTH(complaint-lists.created_at) = :targetMonth`, {
        targetMonth,
      });
    }

    if (status) {
      queryBuilder.andWhere(`complaint-lists.status = :status`, { status });
    }

    if (
      user_created !== undefined &&
      (Array.isArray(user_created)
        ? user_created.some((item) => item !== '') // แก้ไขจาก category.some
        : user_created !== '')
    ) {
      queryBuilder.andWhere(`complaint-lists.user_created = :user_created`, {
        user_created,
      });
    }

    if (
      category !== undefined &&
      (Array.isArray(category)
        ? category.some((item) => item !== '')
        : category !== '')
    ) {
      queryBuilder.andWhere('complaintJobCatagory.id IN (:...category)', {
        category,
      });
    }

    return queryBuilder;
  };

  // ถ้าไม่มี textfilter ใช้วิธีเดิม
  if (!textfilter) {
    const queryBuilder = applyFilters(baseQueryBuilder());
    const [data, total] = await queryBuilder
      .take(take)
      .skip((page - 1) * take)
      .getManyAndCount();

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  // ถ้ามี textfilter ต้องดึงข้อมูลทั้งหมดมา filter แล้วค่อย paginate
  const allDataQueryBuilder = applyFilters(baseQueryBuilder());
  const allData = await allDataQueryBuilder.getMany();

  // Filter ข้อมูลด้วย textfilter
  const filteredData = allData.filter((item) => {
    for (const field in item) {
      if (
        typeof item[field] === 'string' &&
        item[field].includes(textfilter)
      ) {
        return true;
      }
    }
    return false;
  });

  // คำนวณ pagination หลังจาก filter แล้ว
  const total = filteredData.length;
  const startIndex = (page - 1) * take;
  const endIndex = startIndex + take;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    meta: {
      total,
      page,
      last_page: Math.ceil(total / take),
    },
  };
}

  async paginateByFilterByDepartMent(
    filterData: any,
    page = 1,
    relations = [],
  ): Promise<PaginatedResult> {
    const responsible_persons = filterData.responsible_persons;
    const targetMonth = filterData.targetMonth;
    const textfilter = filterData.textfilter;
    const status = filterData.status;
    const category = filterData.category;
    const jobDepartment = filterData.jobDepartment;
    const user_created = filterData.user_created;

    console.log(filterData);
    const take = 1000000;
    const queryBuilder = this.repository
      .createQueryBuilder('complaint-lists')
      .leftJoinAndSelect(
        'complaint-lists.complaintJobCatagory',
        'complaintJobCatagory',
      )
      .leftJoinAndSelect('complaint-lists.jobDepartment', 'jobDepartment')
      .leftJoinAndSelect(
        'complaint-lists.complaintTransaction',
        'complaintTransaction',
      )
      .leftJoinAndSelect('complaint-lists.user_created', 'user_created')
      .leftJoinAndSelect('complaint-lists.project', 'project')
      .leftJoinAndSelect(
        'complaint-lists.complaintAttachedFile',
        'complaintAttachedFile',
      )
      .leftJoinAndSelect(
        'complaint-lists.responsible_persons',
        'responsible_persons',
      )
      .leftJoinAndSelect(
        'complaint-lists.omPersons',
        'omPersons',
      ).leftJoinAndSelect(
        'complaint-lists.contactChannel',
        'contactChannel',
      ).leftJoinAndSelect(
        'complaint-lists.businessUnit',
        'businessUnit',
      )
      .leftJoinAndSelect(
        'complaintTransaction.complaintTransactionAttachedFile',
        'complaintTransactionAttachedFile',
      )
      .orderBy('complaint-lists.created_at', 'DESC');
    if (
      responsible_persons !== undefined &&
      (Array.isArray(responsible_persons)
        ? responsible_persons.some((item) => item !== '')
        : responsible_persons !== '')
    ) {
      queryBuilder.andWhere(
        'responsible_persons.user_id IN (:...responsible_persons)',
        { responsible_persons },
      );
    }
    if (
      jobDepartment !== undefined &&
      jobDepartment !== '' &&
      jobDepartment !== null
    ) {
      queryBuilder.andWhere(
        'jobDepartment.job_departments_id IN (:jobDepartment)',
        {
          jobDepartment,
        },
      );
    }
    if (targetMonth) {
      // Filter the data based on the target month
      queryBuilder.andWhere(`MONTH(complaint-lists.created_at) = :targetMonth`, {
        targetMonth,
      });
    }
    if (status) {
      // Filter the data based on the status
      queryBuilder.andWhere(`complaint-lists.status = :status`, { status });
    }

    if (
      user_created !== undefined &&
      (Array.isArray(user_created)
        ? category.some((item) => item !== '')
        : user_created !== '')
    ) {
      queryBuilder.andWhere(`complaint-lists.user_created = :user_created`, {
        user_created,
      });
    }

    if (
      category !== undefined &&
      (Array.isArray(category)
        ? category.some((item) => item !== '')
        : category !== '')
    ) {
      queryBuilder.andWhere('complaintJobCatagory.id IN (:...category)', {
        category,
      });
    }

    const [data, total] = await queryBuilder
      .take(take)
      .skip((page - 1) * take)
      .getManyAndCount();

    if (textfilter) {
      const filteredData = data.filter((item) => {
        for (const field in item) {
          if (
            typeof item[field] === 'string' &&
            item[field].includes(textfilter)
          ) {
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
          last_page: Math.ceil(total / take),
        },
      };
    }
    if (!textfilter) {
      return {
        data: data,
        meta: {
          total,
          page,
          last_page: Math.ceil(total / take),
        },
      };
    }
  }

  async findJobsByUserId(
    userIdsss: number,
    page = 1,
    relations = [],
  ): Promise<[any[], number]> {
    const userId = '67aeef42-8ac3-4605-a992-3656d2eae84f';
    const options = {
      relations: ['responsible_persons'], // กำหนดเรียกดึงความสัมพันธ์กับ Entity User
      where: {
        responsible_persons: {
          user_id: '67aeef42-8ac3-4605-a992-3656d2eae84f',
        }, // กำหนดเงื่อนไขในการค้นหาด้วยค่า user_id
      },
    };

    const [jobs, count] = await this.repository.findAndCount({
      relations: ['responsible_persons'], // กำหนดเรียกดึงความสัมพันธ์กับ Entity User
      where: {
        responsible_persons: {
          user_id: '67aeef42-8ac3-4605-a992-3656d2eae84f',
        }, // กำหนดเงื่อนไขในการค้นหาด้วยค่า user_id
      },
    });

    return [jobs, count];
  }

  async create(data): Promise<any> {
    return this.repository.save(data);
  }

  async findOne(condition, relations = []): Promise<any> {
    return this.repository.findOne({ where: condition, relations });
  }

  async findOneVender(relations = []): Promise<any> {
    return this.repository.find({
      take: 1,
      where: { approved: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOneofRequestDelete(condition): Promise<any> {
    return this.repository.find({
      where: { complaintListComplaintId: condition },
    });
  }
  async findOneofRequestDeleteVender(condition): Promise<any> {
    return this.repository.find({
      where: { vender_id: condition },
    });
  }

  async findAll(condition): Promise<any> {
    return this.repository.find({
      where: { user_id: In(condition) },
    });
  }

  async find(): Promise<any> {
    return this.repository.find({
      relations: ['jobDepartment'],
    });
  }

  async update(user_id: any, data): Promise<any> {
    return this.repository.update(user_id, data);
  }
  async updateData(id: string, data): Promise<any> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<any> {
    return this.repository.delete(id);
  }
}
