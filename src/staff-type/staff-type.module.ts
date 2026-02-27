import { Module } from '@nestjs/common';
import { StaffTypeService } from './staff-type.service';
import { StaffTypeController } from './staff-type.controller';
import { StaffType } from './staff-type.entiry';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffType]),
],
  providers: [StaffTypeService],
  controllers: [StaffTypeController]
})
export class StaffTypeModule {}
