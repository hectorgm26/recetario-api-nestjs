import { Not } from './../../generated/prisma/internal/prismaNamespace';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegistroDto } from 'src/dtos/registro.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {

    private prisma: any;
    
      constructor(private mailService: MailerService, private jwtService: JwtService) {
        this.prisma = new PrismaClient();
      }

    async addDatos(dto: RegistroDto, request: any) {
      // Se verifica si el correo ya existe, es decir, si el usuario ya esta registrado, ya que el correo es unico
      const existe = await this.prisma.usuario.findFirst({
        where: {
          correo: dto.correo,
        },
      });

      if (existe) {
        throw new HttpException(
          {
            estado: HttpStatus.BAD_REQUEST,
            error: 'Ocurrio un error inesperado',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const token = uuidv4(); // Genera un token unico para la verificacion de la cuenta

      // Se crea la URL de verificacion mediante el token generado + la direccion del servidor
      const url = `${request.protocol}://${request.get('host')}/api/v1/usuarios/verificacion/${token}`;
      
      await this.prisma.usuario.create({
        data: {
          nombre: dto.nombre,
          correo: dto.correo,
          password: await bcrypt.hash(dto.password, 10), // 10 seran los saltos de encriptacion, que son las veces que se aplica el algoritmo
          token: token,
        },
      });

      // Se envia el email
      await this.mailService.sendMail({
        from: 'Prueba NestJS "<yo@hectorelfather.com>"',
        to: dto.correo,
        subject: 'Verificacion de cuenta',
        html: `Hola <b>${dto.nombre}</b>, por favor verifica tu cuenta dando click en el siguiente enlace: <a href="${url}">Verificar cuenta</a>
        O copia y pega el siguiente enlace en tu navegador: ${url}
        `,
      });

      return {
        estado: 'OK',
        mensaje: 'Usuario registrado correctamente',
      };
    }

    async updateDatosVerificacion(token: any, response: any) {

        // Verifica si existe usuario que no este activo
        const datos = await this.prisma.usuario.findFirst({
            where: {
                token: token,
                estado_id: 2
            }
        });

        // Expiracion de token, ya que una vez pasado eliminamos el token y dejamos activo al usuario, y queda en un loop infinito de verificacion
        if (!datos) {
            throw new HttpException(
              {
                estado: HttpStatus.NOT_FOUND,
                error: 'Recurso no disponible',
              },
              HttpStatus.NOT_FOUND,
            );
        }

        await this.prisma.usuario.update({
            where: {
                id: datos.id
            },
            data: {
                token: '',
                estado_id: 1
            }
        });

        return response.redirect(`${process.env.CURSO_BASE_URL_FRONTEND}login`);
    }

    // Login
    async getLogin(correo: string, password: string) {

        const datos = await this.prisma.usuario.findFirst({
            where: {
                correo: correo,
                estado_id: 1
            }
        });

        // Si no existe el usuario o no esta activo
        if (!datos) {
            throw new HttpException(
              {
                estado: HttpStatus.BAD_REQUEST,
                error: 'Recurso no disponible',
              },
              HttpStatus.BAD_REQUEST,
            );
        }

        // Verifica la contraseña, ya que la pass ingresada no es la misma que la de la base de datos que esta encriptada
        let isMatch = await bcrypt.compare(password, datos.password);

        if (isMatch) {

            // header.payload.firma = estructura del JWT token
            const payload = {
                 username: datos.correo, 
                 sub: datos.id
            };

            return {
                id: datos.id,
                nombre: datos.nombre,
                token: this.jwtService.sign(payload),
            }

        } else {
            throw new HttpException(
              {
                estado: HttpStatus.BAD_REQUEST,
                error: 'Recurso no disponible',
              },
              HttpStatus.BAD_REQUEST,
            );
        }


    }

}
