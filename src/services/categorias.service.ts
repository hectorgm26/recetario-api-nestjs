import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { CategoriaDto } from 'src/dtos/categoria.dto';

@Injectable()
export class CategoriasService {

  private prisma: any;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDatos() {
    return await this.prisma.categoria.findMany({
      orderBy: [{ id: 'asc' }],
    });
  }

  async getDato(id: any) {
    const datos = await this.prisma.categoria.findFirst({
        where: { id: id }
    });

    if (!datos) {
        throw new HttpException({
            estado: HttpStatus.BAD_REQUEST,
            error: "El registro no existe en el sistema" // Ocurrio un error inesperado,
        }, HttpStatus.BAD_REQUEST);
    } else {
        return datos;
    }
  }

  async addDatos(dto: CategoriaDto) {
    const existe = await this.prisma.categoria.findFirst({
        where: { nombre: dto.nombre}
    });

    if (existe) {
        // Forma resumida de lanzar la excepción
        throw new HttpException(`El registro: ${dto.nombre} ya existe en el sistema`, HttpStatus.BAD_REQUEST);
    }

    await this.prisma.categoria.create({
        data: {
            nombre: dto.nombre,
            slug: slugify(dto.nombre.toLowerCase())
        }
    });

    return {
        estado: "OK",
        mensaje: "Registro creado correctamente"
    }
  }

  async updateDatos(id: any, dto: CategoriaDto) {
    const datos = await this.prisma.categoria.findFirst({
      where: { id: id },
    });

    if (!datos) {
      throw new HttpException("El registro no existe en el sistema", HttpStatus.BAD_REQUEST);
    } 

    await this.prisma.categoria.update({
        where: { id: id },
        data: {
            nombre: dto.nombre,
            slug: slugify(dto.nombre.toLowerCase())
        }
    });

    return {
      estado: 'OK',
      mensaje: 'Se ha modificado el registro correctamente',
    };
  }

  async deleteDato(id: any) {
    const datos = await this.prisma.categoria.findFirst({
      where: { id: id },
    });

    if (!datos) {
      throw new HttpException(
        'El registro no existe en el sistema',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Se buscan recetas asociadas a la categoría
    const existe = await this.prisma.receta.findMany({
        where: { categoria_id : id}
    }); // retorna un arreglo

    // Si el largo del arreglo es 0, significa que no hay recetas asociadas a esa categoría
    if (existe.length  == 0) {
        await this.prisma.categoria.delete({
            where: { id: id }
        })

        return ({
            estado: 'OK',
            mensaje: 'Registro eliminado correctamente'
        });

    } else {
        throw new HttpException(
            'No se puede eliminar la categoría porque tiene recetas asociadas',
            HttpStatus.BAD_REQUEST,
        );
    }
  }

}
