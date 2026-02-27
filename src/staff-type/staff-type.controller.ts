import { Controller, Get } from '@nestjs/common';
import { StaffTypeService } from './staff-type.service';

@Controller('staff-type')
export class StaffTypeController {
    constructor(private staffTypeService: StaffTypeService) {
    }

    @Get()
    async all() {
        return this.staffTypeService.all();
    }
}
