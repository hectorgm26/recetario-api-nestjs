import { Module } from '@nestjs/common';
import { EjemploController } from './controllers/ejemplo/ejemplo.controller';
import { EjemploService } from './services/ejemplo.service';
import { UploadController } from './controllers/upload/upload.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { CategoriasService } from './services/categorias.service';
import { CategoriasController } from './controllers/categorias/categorias.controller';
import { RecetasController } from './controllers/recetas/recetas.controller';
import { RecetasService } from './services/recetas.service';
import { RecetasHelperController } from './controllers/recetas-helper/recetas-helper.controller';
import { ContactoService } from './services/contacto.service';
import { ContactoController } from './controllers/contacto/contacto.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsuariosService } from './services/usuarios.service';
import { UsuariosController } from './controllers/usuarios/usuarios.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '..', 'client'),
      rootPath: join(process.cwd(), 'assets/uploads'), // apunta a la raíz del proyecto, y crear un index.html vacio
      serveRoot: '/uploads', // expone la carpeta en /uploads
      // y con http://localhost:3000/uploads/1762737508175.jpg podemos acceder a la imagen subida
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_SERVER,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }),
    JwtModule.register({
      secret: process.env.CURSO_SERVER_JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    EjemploController,
    UploadController,
    CategoriasController,
    RecetasController,
    RecetasHelperController,
    ContactoController,
    UsuariosController,
  ],
  providers: [
    EjemploService,
    CategoriasService,
    RecetasService,
    ContactoService,
    UsuariosService,
    JwtStrategy
  ],
})
export class AppModule {}
