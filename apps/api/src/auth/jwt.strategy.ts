import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // payload = { sub: userId, email, rol }
  async validate(req: any, payload: any) {
    // Para access tokens no verificamos revocación en BD (solo refresh tokens)
    // El access token se valida solo por su firma y expiración
    return { 
      sub: payload.sub, 
      email: payload.email,
      rol: payload.rol 
    };
  }
}
