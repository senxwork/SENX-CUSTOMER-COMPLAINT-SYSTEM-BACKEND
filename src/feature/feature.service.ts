import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';
import { Repository } from 'typeorm';
import { Feature } from './feature.entity';

@Injectable()
export class FeatureService extends AbstractService {
    constructor(
        @InjectRepository(Feature) private readonly featureRepository: Repository<Feature>
    ) {
        super(featureRepository);
    }
}

