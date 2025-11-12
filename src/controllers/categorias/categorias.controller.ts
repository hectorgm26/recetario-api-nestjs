import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriaDto } from 'src/dtos/categoria.dto';
import { CategoriasService } from 'src/services/categorias.service';

@Controller('categorias')
@ApiTags('Categorias')
export class CategoriasController {
  constructor(private categoriaService: CategoriasService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  index() {
    return this.categoriaService.getDatos();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  show(@Param('id') id) {
    return this.categoriaService.getDato(parseInt(id));
    // El parse es necesario, ya que convierte el parámetro de la URL que siempre llega como string
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CategoriaDto) {
    return this.categoriaService.addDatos(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  update(@Body() dto: CategoriaDto, @Param('id') id: any) {
    return this.categoriaService.updateDatos(parseInt(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  destroy(@Param('id') id: any) {
    return this.categoriaService.deleteDato(parseInt(id));
  }
}
