import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo correo no debe estar vacio' })
  @IsEmail({}, { message: 'El correo ingresado no es valido' })
  correo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La contraseña no debe esta vacia' })
  password: string;
}