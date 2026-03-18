import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderHistoryController } from './work-order-history.controller';

describe('WorkOrderHistoryController', () => {
  let controller: WorkOrderHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrderHistoryController],
    }).compile();

    controller = module.get<WorkOrderHistoryController>(WorkOrderHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
