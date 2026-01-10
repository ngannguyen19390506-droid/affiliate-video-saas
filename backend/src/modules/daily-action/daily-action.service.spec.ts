import { Test, TestingModule } from '@nestjs/testing';
import { DailyActionService } from './daily-action.service';

describe('DailyActionService', () => {
  let service: DailyActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyActionService],
    }).compile();

    service = module.get<DailyActionService>(DailyActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
