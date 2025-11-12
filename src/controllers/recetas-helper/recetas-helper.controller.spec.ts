import { Test, TestingModule } from '@nestjs/testing';
import { RecetasHelperController } from './recetas-helper.controller';

describe('RecetasHelperController', () => {
  let controller: RecetasHelperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecetasHelperController],
    }).compile();

    controller = module.get<RecetasHelperController>(RecetasHelperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
