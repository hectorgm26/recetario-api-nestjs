import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RegistroDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo correo no debe estar vacio' })
  @IsEmail({}, { message: 'El correo ingresado no es valido' })
  correo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La contraseña no debe esta vacia' })
  password: string;
}