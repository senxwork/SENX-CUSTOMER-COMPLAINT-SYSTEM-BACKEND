import { Injectable } from '@nestjs/common';
import { StaffType } from './staff-type.entiry';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {AbstractService} from "../common/abstract.service";
@Injectable()
export class StaffTypeService  extends AbstractService{
    constructor(
        @InjectRepository(StaffType) private readonly staffTypeRepository: Repository<StaffType>
    ) {
        super(staffTypeRepository);
    }
}
