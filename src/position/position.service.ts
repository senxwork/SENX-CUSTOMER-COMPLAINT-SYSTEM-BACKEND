import { Injectable } from '@nestjs/common';
import { Position } from './position.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract.service';

@Injectable()
export class PositionService extends AbstractService {
    constructor(
        @InjectRepository(Position) private readonly positionRepository: Repository<Position>
    ) {
        super(positionRepository);
    }
}