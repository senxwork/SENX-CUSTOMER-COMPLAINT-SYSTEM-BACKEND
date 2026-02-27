import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './position.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Position]),
],
  providers: [PositionService],
  controllers: [PositionController]
})
export class PositionModule {}
