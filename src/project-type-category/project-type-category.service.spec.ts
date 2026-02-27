import { Test, TestingModule } from '@nestjs/testing';
import { ProjectTypeCategoryService } from './project-type-category.service';

describe('ProjectTypeCategoryService', () => {
  let service: ProjectTypeCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectTypeCategoryService],
    }).compile();

    service = module.get<ProjectTypeCategoryService>(ProjectTypeCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
