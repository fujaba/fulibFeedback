import { Test, TestingModule } from '@nestjs/testing';
import {Task} from '../assignments-api/assignment';
import { TaskMatcherService } from './task-matcher.service';

describe('TaskMatcherService', () => {
  let service: TaskMatcherService;
  const text = 'foo { bar { } }';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskMatcherService],
    }).compile();

    service = module.get<TaskMatcherService>(TaskMatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
