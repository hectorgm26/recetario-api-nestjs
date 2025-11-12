import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RecetaDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe estar vacio' })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo tiempo no debe estar vacio' })
  tiempo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo descripcion no debe estar vacio' })
  descripcion: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo categoria_id es requerido' })
  categoria_id: string;

  @ApiProperty()
  usuario_id?: string;
}
