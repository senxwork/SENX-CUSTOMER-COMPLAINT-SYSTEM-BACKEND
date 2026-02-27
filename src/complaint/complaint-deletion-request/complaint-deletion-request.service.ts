import { Injectable } from '@nestjs/common';
import { ComplaintRequestDelete } from './requestDelete.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';


@Injectable()
export class ComplaintDeletionRequestService extends AbstractService {
 constructor(
        @InjectRepository(ComplaintRequestDelete) private readonly complaintRequestDeleteRepository: Repository<ComplaintRequestDelete>
    ) {
        super(complaintRequestDeleteRepository);
    }}
