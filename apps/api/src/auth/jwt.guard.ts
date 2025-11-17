import { AuthGuard } from '@nestjs/passport';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token caducado. Por favor, renueve su token usando /auth/refresh o inicie sesión nuevamente.');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido. Por favor, proporcione un token válido.');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('No se proporcionó token de autenticación. Incluya el header: Authorization: Bearer <token>');
      }
      throw err || new UnauthorizedException('Acceso no autorizado. Token inválido o ausente.');
    }
    return user;
  }
}
