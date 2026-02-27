import { Test, TestingModule } from '@nestjs/testing';
import { ProjectTypeCategoryController } from './project-type-category.controller';

describe('ProjectTypeCategoryController', () => {
  let controller: ProjectTypeCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectTypeCategoryController],
    }).compile();

    controller = module.get<ProjectTypeCategoryController>(ProjectTypeCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
