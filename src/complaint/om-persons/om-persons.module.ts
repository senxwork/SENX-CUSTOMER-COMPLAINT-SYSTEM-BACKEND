import { Module } from '@nestjs/common';
import { OmPersonsService } from './om-persons.service';
import { OmPersonsController } from './om-persons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OmPersons } from './om-persons.entity';

@Module({
   imports: [TypeOrmModule.forFeature([OmPersons])],
  providers: [OmPersonsService],
  controllers: [OmPersonsController]
})
export class OmPersonsModule {}
