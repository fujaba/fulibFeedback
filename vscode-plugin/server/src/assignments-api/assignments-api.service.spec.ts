import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsApiService } from './assignments-api.service';

describe('AssignmentsApiService', () => {
  let service: AssignmentsApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentsApiService],
    }).compile();

    service = module.get<AssignmentsApiService>(AssignmentsApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
