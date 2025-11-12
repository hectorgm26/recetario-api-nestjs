import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // configurar prefijo global para las rutas
  app.setGlobalPrefix('api/v1');

  // habilitar cors
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Recetas')
    .setDescription('API creada con NestJS y Prisma ORM para la gestion de recetas de cocina')
    .setVersion('1.0')
    .addTag('Recetas')
    .addTag('Usuarios')
    .addTag('Categorias')
    .addTag('Contacto')
    .addTag('Recetas Helper')
    .addTag('Ejemplo')
    .addTag('Upload')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentacion', app, documentFactory);
  // en el navegador, acceder a http://localhost:3000/documentacion
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
