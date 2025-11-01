import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usuarios: UsuariosService,
    private jwt: JwtService
  ) {}

  async signup(email: string, password: string, nombreCompleto: string, telefono?: string) {
    const user = await this.usuarios.create(email, password, nombreCompleto, telefono);
    return this.sign(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.usuarios.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    
    const ok = await bcrypt.compare(password, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    
    return this.sign(user.id, user.email);
  }

  private sign(sub: string, email: string) {
    const access_token = this.jwt.sign(
      { sub, email },
      { expiresIn: Number(process.env.JWT_EXPIRES) ?? 86400 }
    );
    return { access_token };
  }
}
