import { Body, Controller, Delete, FileTypeValidator, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecetaDto } from 'src/dtos/receta.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RecetasService } from 'src/services/recetas.service';

@Controller('recetas')
@ApiTags('Recetas')
export class RecetasController {
  constructor(private recetasService: RecetasService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async index(@Req() request: Request) {
    // el request de Express entrega info de la petición HTTP

    const datos = this.recetasService.getDatos();

    // Combiene hacer el mapeo de que datos traer aqui en el Controller, ya que podemos hacer un formateo, y con el ORM solo decidimos que traer y que no

    let array = Array(); // Array() se diferencia de [] en que este ultimo es inmutable, es decir, no se le pueden agregar elementos despues de su creacion

    // Formateamos los datos
    for (const dato of await datos) {
      array.push({
        id: dato.id,
        nombre: dato.nombre,
        slug: dato.slug,
        tiempo: dato.tiempo,
        fecha: dato.fecha.toLocaleDateString('es-CL'), // Formateamos la fecha a un formato legible
        foto: `${request.protocol}://${request.get('Host')}/uploads/recetas/${dato.foto}`,
        descripcion: dato.descripcion,
        categoria_id: dato.categoria.id,
        categoria: dato.categoria.nombre, // Para que no cargue todo el objeto de la categoria, solo el nombre
        usuario_id: dato.usuario.id,
        usuario: dato.usuario.nombre
      });
    }
    return array;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async show(@Param('id') id: any, @Req() request: Request) {
    const dato = await this.recetasService.getDato(parseInt(id));

    return {
      id: dato.id,
      nombre: dato.nombre,
      slug: dato.slug,
      tiempo: dato.tiempo,
      fecha: dato.fecha.toLocaleDateString('es-CL'),
      foto: `${request.protocol}://${request.get('Host')}/uploads/recetas/${dato.foto}`,
      descripcion: dato.descripcion,
      categoria_id: dato.categoria.id,
      categoria: dato.categoria.nombre,
      usuario_id: dato.usuario.id,
      usuario: dato.usuario.nombre,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './assets/uploads/recetas',
        filename: (req, file, callback) => {
          callback(null, `${Date.now()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() dto: RecetaDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg)',
            skipMagicNumbersValidation: true,
          }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.recetasService.addDatos(dto, file.filename);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: any, @Body() dto: RecetaDto) {
    return this.recetasService.updateDatos(parseInt(id), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  destroy(@Param('id') id: any) {
    return this.recetasService.delete(parseInt(id));
  }

  /*
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: RecetaDto) {
    return this.recetasService.addDatos(dto, "1725054433754.png");
  }
    */
}
