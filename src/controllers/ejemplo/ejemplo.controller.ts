import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EjemploDto } from 'src/dtos/ejemplo.dto';
import type { EjemploInterface } from 'src/interfaces/ejemplo-interface.interface'; // IMPORTANTE: type para interfaces y tipos, ya que no se compilan a JS
import { EjemploService } from 'src/services/ejemplo.service';

@ApiTags('Ejemplo')
@Controller('ejemplo') // esta siempre sera la base de la ruta
export class EjemploController {

    constructor(private ejemploService: EjemploService) {}

  // si se deja vacio es la ruta base /ejemplo, y si se coloca algo, seria la ruta base/lo_que_se_coloco en los parentesis
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cabecero_hector', 'EL_FATHER')
  index(): EjemploInterface {
    return { estado: 'OK', mensaje: `Metodo Get | service: ${this.ejemploService.getTexto('Hola Mundo')}` };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  show(@Param('id') paramId: string) {
    return { estado: 'OK', mensaje: `Metodo Get con parametro: ${paramId}` };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  create(@Body() dto: EjemploDto) {
    // un dto es un contrato de datos de las apis

    return {
      estado: 'OK',
      mensaje: `Metodo Post | titulo: ${dto.titulo} | descripcion: ${dto.descripcion} | precio: ${dto.precio} | categoria_id: ${dto.categoria_id} | valido: ${dto.valido}`,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') paramId: string) {
    return { estado: 'OK', mensaje: `Metodo Put con parametro: ${paramId}` };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  destroy(@Param('id') paramId: string) {
    return { estado: 'OK', mensaje: `Metodo Delete con parametro: ${paramId}` };
  }

  /*

  @Get()
  index() {
    return 'Metodo Get';
  }

  @Get(':id')
  show(@Param('id') paramId: string) {
    return `Metodo Get con parametro: ${paramId}`;
  }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() dto: EjemploDto) { // un dto es un contrato de datos de las apis

    return `Metodo Post | titulo: ${dto.titulo} | descripcion: ${dto.descripcion} | precio: ${dto.precio} | categoria_id: ${dto.categoria_id} | valido: ${dto.valido}`;
  }

  @Post()
  create(@Body() bodyJson) {
    return `Metodo Post con body: ${bodyJson.correo} y ${bodyJson.password}`;
  }

  @Put(':id')
  update(@Param('id') paramId: string) {
    return `Metodo Put con parametro: ${paramId}`;
  }

  @Delete(':id')
  destroy(@Param('id') paramId: string) {
    return `Metodo Delete con parametro: ${paramId}`;
  }

  */
}
