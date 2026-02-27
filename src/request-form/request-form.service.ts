import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { Repository } from 'typeorm';
import { RequestForm } from './request-form.entity';

@Injectable()
export class RequestFormService extends AbstractService {
    constructor(
        @InjectRepository(RequestForm) private readonly requestFormRepository: Repository<RequestForm>
    ) {
        super(requestFormRepository);
    }
}
