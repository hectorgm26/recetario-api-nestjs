import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class ContactoDto {
    
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe estar vacio' })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo correo no debe estar vacio' })
  @IsEmail({}, { message: 'El correo ingresado no es valido' })
  correo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo telefono no debe estar vacio' })
  @IsPhoneNumber('CL', {
    message: 'El numero de telefono ingresado no es valido',
  })
  telefono: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo mensaje no debe estar vacio' })
  mensaje: string;
}