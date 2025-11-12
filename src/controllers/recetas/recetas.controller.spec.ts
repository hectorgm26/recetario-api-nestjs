import { Test, TestingModule } from '@nestjs/testing';
import { RecetasController } from './recetas.controller';

describe('RecetasController', () => {
  let controller: RecetasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecetasController],
    }).compile();

    controller = module.get<RecetasController>(RecetasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
