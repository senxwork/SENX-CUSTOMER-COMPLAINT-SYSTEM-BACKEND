/* eslint-disable prettier/prettier */
import { EntityRepository, Repository } from 'typeorm';
import { ComplaintList } from './complaint-list.entity';
import { CreateComplaintListDto } from './dto/create-complaint-list.dto';



@EntityRepository(ComplaintList)
export class ComplaintListRepository extends Repository<ComplaintList> {



}
