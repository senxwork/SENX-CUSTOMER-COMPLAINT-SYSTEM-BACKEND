import { Controller, Get } from '@nestjs/common';
import { PositionService } from './position.service';

@Controller('position')
export class PositionController {
    constructor(private positionService: PositionService) {
    }
    @Get()
    async all() {
        return this.positionService.all(['staffType']);

    }
}
