import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
      
    // si hay un error o no hay usuario, se lanza una excepcion de no autorizado
    if(err || !user) {
        throw err || new UnauthorizedException(); // retorna un estado http 401 no autorizado
      }

      return user;
  }
}
