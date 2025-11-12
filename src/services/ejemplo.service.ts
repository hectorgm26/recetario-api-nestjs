import { Injectable } from '@nestjs/common';

@Injectable()
export class EjemploService {

    getTexto(parametro: string) {
        return "El valor del parametro es: " + parametro + " | test env: " + process.env.CURSO_TEST;
    }
    // Para acceder a las variables de entorno usamos process.env.NOMBRE_VARIABLE
}
