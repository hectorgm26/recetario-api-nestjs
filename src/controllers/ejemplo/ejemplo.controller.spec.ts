import { Test, TestingModule } from '@nestjs/testing';
import { EjemploController } from './ejemplo.controller';

describe('EjemploController', () => {
  let controller: EjemploController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EjemploController],
    }).compile();

    controller = module.get<EjemploController>(EjemploController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
