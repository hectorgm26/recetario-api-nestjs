import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class EjemploDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El titulo no debe estar vacio' })
  titulo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La descripcion no debe estar vacia' })
  descripcion: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El precio no debe estar vacio' })
  @IsNumber({}, { message: 'El precio debe ser un numero' }) // Maña de algunas validaciones, se le pasa primero un objeto vacio y luego otro objeto con las opciones
  precio: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'La categoria_id no debe estar vacia' })
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  categoria_id: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo valido no debe estar vacio' })
  @IsBoolean({ message: 'El campo valido debe ser booleano' })
  valido: boolean;
}