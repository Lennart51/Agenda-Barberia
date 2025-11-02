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
    const token = this.sign(user.id, user.email);
    
    return {
      ...token,
      usuario: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.usuarios.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    
    const ok = await bcrypt.compare(password, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    
    const token = this.sign(user.id, user.email);
    
    return {
      ...token,
      usuario: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
      },
    };
  }

  async me(userId: string) {
    const user = await this.usuarios.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    
    return {
      id: user.id,
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      rol: user.rol,
    };
  }

  private sign(sub: string, email: string) {
    const access_token = this.jwt.sign(
      { sub, email },
      { expiresIn: Number(process.env.JWT_EXPIRES) ?? 86400 }
    );
    return { access_token };
  }
}
