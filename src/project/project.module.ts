import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRepository } from './project.repository';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectRepository]),MulterModule.registerAsync({
    useFactory: () => ({
      dest: './upload',
    }),
  })],
  providers: [ProjectService],
  controllers: [ProjectController]
})
export class ProjectModule {}
