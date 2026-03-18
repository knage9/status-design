import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderHistoryService } from './work-order-history.service';

describe('WorkOrderHistoryService', () => {
  let service: WorkOrderHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrderHistoryService],
    }).compile();

    service = module.get<WorkOrderHistoryService>(WorkOrderHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
