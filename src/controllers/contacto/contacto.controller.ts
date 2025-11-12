import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactoDto } from 'src/dtos/contacto.dto';
import { ContactoService } from 'src/services/contacto.service';

@Controller('contacto')
@ApiTags('Contacto')
export class ContactoController {

    constructor(private contactoService: ContactoService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe())
    create(@Body() dto: ContactoDto) {
        return this.contactoService.addDatos(dto);
    }

    
}
