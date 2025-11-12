import { Body,Controller,FileTypeValidator,MaxFileSizeValidator,ParseFilePipe,Post,UploadedFile, UseInterceptors} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

export class SampleDto {
    producto_id: number;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {

  @Post()
  @UseInterceptors(
    // el primer dato sera el nombre del campo que se envia en el form-data
    // el segundo dato es un objeto de configuracion de multer
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './assets/uploads',
        filename: (req, file, callback) => {
          callback(null, `${Date.now()}${extname(file.originalname)}`);
          // el primer argumento se le pasa null para indicar que no hubo error, y el segundo es el nombre del archivo
        },
      }),
    }),
  )
  create(@Body() dto: SampleDto, @UploadedFile(
    new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg)', // solo permite imagenes
            skipMagicNumbersValidation: true, // omite la verificación binaria del archivo y valida solo por mimetype
          }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ){
    return {
      estado: 'OK',
      mensaje: 'Se subio el archivo correctamente',
      nombre: file.originalname,
      archivoSubido: file.filename,
      mimetype: file.mimetype,
      producto_id: dto.producto_id
    };
    // originalname es el nombre del archivo en el equipo del usuario
    // filename es el nombre del archivo como se guardo en el servidor
    // mimetype es el tipo de archivo
  }

  /* 
    @Post()
    @UseInterceptors(
        // el primer dato sera el nombre del campo que se envia en el form-data
        // el segundo dato es un objeto de configuracion de multer
        FileInterceptor('file', {storage: diskStorage(
            {
                destination: './assets/uploads', 
                filename: (req, file, callback) => {
                    callback(null, `${Date.now()}${extname(file.originalname)}`);
                    // el primer argumento se le pasa null para indicar que no hubo error, y el segundo es el nombre del archivo
                }
            })})
    )
    create(@UploadedFile() file: Express.Multer.File) {
        return {estado: "OK", mensaje: "Se subio el archivo correctamente", nombre: file.originalname, archivoSubido: file.filename, mimetype: file.mimetype};
        // originalname es el nombre del archivo en el equipo del usuario
        // filename es el nombre del archivo como se guardo en el servidor
        // mimetype es el tipo de archivo
    }
        */
}
