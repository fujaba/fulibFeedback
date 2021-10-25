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

  it('should match Tasks', () => {
    const dummy: Task = {_id: '', children: [], points: 0, description: ''};
    const foo: Task = {
      ...dummy,
      description: '`foo`',
    };
    expect(service.getApplicableRange(foo, text)).toEqual([5, 14]);

    const fooBar: Task = {
      ...dummy,
      description: '`foo` `bar`',
    };
    expect(service.getApplicableRange(fooBar, text)).toEqual([11, 12]);
  })

  it('should match brackets', () => {
    expect(service.findMatchingBrace(text, 4, text.length)).toBe(14);
    expect(service.findMatchingBrace(text, 10, text.length)).toBe(12);
    expect(service.findMatchingBrace(text, 4, text.length - 1)).toBe(-1);
    expect(service.findMatchingBrace(text, 10, text.length - 1)).toBe(12);
    expect(service.findMatchingBrace(text, 10, text.length - 3)).toBe(-1);
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
