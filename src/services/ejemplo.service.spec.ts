import { Test, TestingModule } from '@nestjs/testing';
import { EjemploService } from './ejemplo.service';

describe('EjemploService', () => {
  let service: EjemploService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EjemploService],
    }).compile();

    service = module.get<EjemploService>(EjemploService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
