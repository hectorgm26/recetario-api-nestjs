import { Controller, FileTypeValidator, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RecetasService } from 'src/services/recetas.service';

@Controller('recetas-helper')
@ApiTags('Recetas Helper')
export class RecetasHelperController {

  constructor(private recetasService: RecetasService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @HttpCode(HttpStatus.OK)
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
  update(
    @Param('id') id: any,
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
    return this.recetasService.updateDatosFoto(parseInt(id), file.filename);
  }

  // Obtener los ultimos 3 registros de recetas
  @Get()
  @HttpCode(HttpStatus.OK)
  async datos_home(@Req() request: Request) {
    const datos = this.recetasService.getDatosHome();
    let array = Array();

    for (const dato of await datos) {
      array.push({
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
      });
    }
    return array;
  }

  @Get('buscador')
  @HttpCode(HttpStatus.OK)
  // con query, pese a poner un solo argumento, se pueden enviar varios en la URL
  async buscador(@Query() query, @Req() request: Request) {
    const datos = this.recetasService.getDatosBuscador(
      query.categoria_id,
      query.search,
    );
    let array = Array();

    for (const dato of await datos) {
      array.push({
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
      });
    }
    return array;
  }

  @UseGuards(JwtAuthGuard)
  @Get('panel/:id')
  @HttpCode(HttpStatus.OK)
  async datos_panel(@Param('id') id: any, @Req() request: Request) {

    const datos = this.recetasService.getDatosPanel(id);
    let array = Array();

    for (const dato of await datos) {
      array.push({
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
      });
    }
    return array;
  }

}
