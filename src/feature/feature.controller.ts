import { Controller, Get } from '@nestjs/common';
import { FeatureService } from './feature.service';

@Controller('feature')
export class FeatureController {
        constructor(private featureService: FeatureService) {
        }

    @Get()
    async all() {
        return this.featureService.all(['permissionCategorys']);
    }
}
