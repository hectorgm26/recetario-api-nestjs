import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { RecetaDto } from 'src/dtos/receta.dto';
import * as fs from 'fs';

@Injectable()
export class RecetasService {
  private prisma: any;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDatos() {
    return await this.prisma.receta.findMany({
      orderBy: [{ id: 'asc' }],
      select: {
        id: true,
        nombre: true,
        slug: true,
        tiempo: true,
        descripcion: true,
        fecha: true,
        foto: true,
        categoria: true,
        usuario: true,
      },
    });
  }

  async getDato(id: any) {
    const datos = await this.prisma.receta.findFirst({
      where: { id: id },
      select: {
        id: true,
        nombre: true,
        slug: true,
        tiempo: true,
        descripcion: true,
        fecha: true,
        foto: true,
        categoria: true,
        usuario: true,
      },
    });

    if (!datos) {
      throw new HttpException(
        {
          estado: HttpStatus.BAD_REQUEST,
          error: 'El registro no existe en el sistema', // Ocurrio un error inesperado,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return datos;
    }
  }

  async addDatos(dto: RecetaDto, foto: any) {
    // Verificamos que la categoría exista, ya que para crear una receta es necesario asignarle una categoría
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: parseInt(dto.categoria_id) },
    });

    if (!categoria) {
      // Si la categoría no existe, eliminamos la foto que se subió al servidor para evitar tener archivos huérfanos (YA QUE NESTJS SIEMPRE SUBE EL ARCHIVO)
      fs.unlink(`./assets/uploads/recetas/${foto}`, () => {});

      throw new HttpException(
        `La categoría con ID: ${dto.categoria_id} no existe en el sistema`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verificamos que no exista otra receta con el mismo nombre
    const existe = await this.prisma.receta.findFirst({
      where: { nombre: dto.nombre },
    });

    if (existe) {
      fs.unlink(`./assets/uploads/recetas/${foto}`, () => {});
      throw new HttpException(
        `El registro: ${dto.nombre} ya existe en el sistema`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.receta.create({
      data: {
        nombre: dto.nombre,
        slug: slugify(dto.nombre.toLowerCase()),
        tiempo: dto.tiempo,
        descripcion: dto.descripcion,
        categoria_id: parseInt(dto.categoria_id),
        usuario_id: dto.usuario_id ? parseInt(dto.usuario_id) : 1, // Primero el dto.usuario_id pregunta si viene el valor, si es asi lo parsea a entero, si no viene asigna 1
        foto: foto,
      },
    });

    return {
      estado: 'OK',
      mensaje: 'Registro creado correctamente',
    };
  }

  async updateDatos(id: any, dto: RecetaDto) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: parseInt(dto.categoria_id) },
    });

    if (!categoria) {
      throw new HttpException(
        `La categoría con ID: ${dto.categoria_id} no existe en el sistema`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const datos = await this.prisma.receta.findFirst({
      where: { id: id },
    });

    if (!datos) {
      throw new HttpException(
        'El registro no existe en el sistema',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.receta.update({
      where: { id: id },
      data: {
        nombre: dto.nombre,
        slug: slugify(dto.nombre.toLowerCase()),
        tiempo: dto.tiempo,
        descripcion: dto.descripcion,
        categoria_id: parseInt(dto.categoria_id),
      },
    });

    return {
      estado: 'OK',
      mensaje: 'Se ha modificado el registro correctamente',
    };
  }

  async delete(id: any) {
    const datos = await this.prisma.receta.findFirst({
      where: { id: parseInt(id) },
    });

    if (!datos) {
      throw new HttpException(
        'El registro no existe en el sistema',
        HttpStatus.BAD_REQUEST,
      );
    }

    fs.unlink(`./assets/uploads/recetas/${datos.foto}`, () => {});

    await this.prisma.receta.delete({
      where: { id: id },
    });

    return {
      estado: 'OK',
      mensaje: 'Se ha eliminado el registro correctamente',
    };
  }

  // *****************METODOS HELPER PARA FOTO**********************

  async updateDatosFoto(id: any, foto: any) {
    // Validar que exista receta
    const datos = await this.prisma.receta.findFirst({
      where: { id: parseInt(id) },
    });

    if (!datos) {
      // borrar la foto subida que se sube igual pese a errores
      fs.unlink(`./assets/uploads/recetas/${foto}`, () => {});

      throw new HttpException(
        'El registro no existe en el sistema',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Borrar la foto anterior en el registro
    fs.unlink(`./assets/uploads/recetas/${datos.foto}`, () => {});

    await this.prisma.receta.update({
      where: { id: parseInt(id) },
      data: {
        foto: foto,
      },
    });

    return {
      estado: 'OK',
      mensaje: 'Se ha modificado el registro correctamente',
    };
  }

  // Obtener los ultimos 3 registros de recetas
  async getDatosHome() {
    return await this.prisma.receta.findMany({
      orderBy: [{ id: 'desc' }],
      skip: 0, // desde el primer registro, para que cargue la primera página
      take: 3, // solo 3 registros, paginar de a 3
      select: {
        id: true,
        nombre: true,
        slug: true,
        tiempo: true,
        descripcion: true,
        fecha: true,
        foto: true,
        categoria: true,
        usuario: true,
      },
    });
  }

  // Buscar recetas por categoria y nombre de busqueda
  async getDatosBuscador(categoria_id: any, search: any) {
    const categoriaExiste = await this.prisma.categoria.findFirst({
      where: { id: parseInt(categoria_id) },
    });

    if (!categoriaExiste) {
      throw new HttpException(
        `La categoría con ID: ${categoria_id} no existe en el sistema`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.prisma.receta.findMany({
      where: {
        categoria_id: parseInt(categoria_id),
        nombre: {
          contains: search,
        },
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        tiempo: true,
        descripcion: true,
        fecha: true,
        foto: true,
        categoria: true,
        usuario: true,
      },
    });
  }

  // Obtener recetas por usuario para el panel de control
  async getDatosPanel(id: any) {
    return await this.prisma.receta.findMany({
      orderBy: [{ id: 'desc' }],
      where: {
        usuario_id: parseInt(id),
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        tiempo: true,
        descripcion: true,
        fecha: true,
        foto: true,
        categoria: true,
        usuario: true,
      },
    });
  }
  
}
