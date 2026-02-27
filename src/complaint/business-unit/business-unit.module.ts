import { Module } from '@nestjs/common';
import { BusinessUnitService } from './business-unit.service';
import { BusinessUnitController } from './business-unit.controller';
import { BusinessUnit } from './business-unit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessUnit])],
  providers: [BusinessUnitService],
  controllers: [BusinessUnitController]
})
export class BusinessUnitModule {}
