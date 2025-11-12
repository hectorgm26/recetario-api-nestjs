import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ContactoDto } from 'src/dtos/contacto.dto';
// npm install --save @nestjs-modules/mailer nodemailer
// npm install --save-dev @types/nodemailer

@Injectable()
export class ContactoService {
  
    private prisma: any;

  constructor(private mailService: MailerService) {
    this.prisma = new PrismaClient();
  }

  async addDatos(dto: ContactoDto) {

    // Crear registro
    await this.prisma.contacto.create({
        data: {
            nombre: dto.nombre,
            correo: dto.correo,
            telefono: dto.telefono,
            mensaje: dto.mensaje
        }
    });

    // Se envia el email
    await this.mailService.sendMail({
        from: 'Prueba NestJS "<yo@hectorelfather.com>"',
        to: dto.correo,
        subject: "Prueba NestJS - Contacto recibido",
        html: dto.mensaje
    });

    return {
        estado: "OK",
        mensaje: "Datos de contacto guardados correctamente"
    }


  }
}
