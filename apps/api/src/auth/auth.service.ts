import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usuarios: UsuariosService,
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async signup(email: string, password: string, nombreCompleto: string, telefono?: string, rol?: string) {
    const user = await this.usuarios.create(email, password, nombreCompleto, telefono, rol);
    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      usuario: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        rol: user.rol,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.usuarios.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas: el email no existe o la contraseña es incorrecta');
    }
    
    const ok = await bcrypt.compare(password, user.contrasena);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas: el email no existe o la contraseña es incorrecta');
    }
    
    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      usuario: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        rol: user.rol,
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

  async refresh(refreshToken: string) {
    try {
      // Verificar si el token existe en la BD y no está revocado
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { usuario: true },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Token de refresco inválido. Por favor, inicie sesión nuevamente.');
      }

      if (tokenRecord.revocado) {
        throw new UnauthorizedException('Token de refresco revocado. Por favor, inicie sesión nuevamente.');
      }

      if (tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Token de refresco caducado. Por favor, inicie sesión nuevamente.');
      }

      // Verificar firma JWT
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET') || 'supersecret_refresh_dev_change_me_barberia_2025',
      });

      // Generar nuevos tokens
      const tokens = await this.generateTokens(tokenRecord.usuario.id, tokenRecord.usuario.email, tokenRecord.usuario.rol);
      
      // Revocar el refresh token anterior
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revocado: true },
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token de refresco caducado. Por favor, inicie sesión nuevamente.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token de refresco inválido. Por favor, inicie sesión nuevamente.');
      }
      throw error;
    }
  }

  async logout(accessToken: string, refreshToken: string) {
    // Revocar el refresh token en la BD
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revocado: true },
      });
    }
    
    return { message: 'Sesión cerrada exitosamente' };
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    
    return tokenRecord?.revocado || false;
  }

  private async generateTokens(sub: string, email: string, rol: string) {
    const access_token = this.jwt.sign(
      { sub, email, rol },
      { 
        secret: this.config.get('JWT_SECRET') || 'supersecret_dev_change_me_barberia_2025',
        expiresIn: Number(this.config.get('JWT_EXPIRES')) || 86400 
      }
    );

    const refreshExpiresIn = Number(this.config.get('JWT_REFRESH_EXPIRES')) || 604800;
    const refresh_token = this.jwt.sign(
      { sub, email, rol },
      { 
        secret: this.config.get('JWT_REFRESH_SECRET') || 'supersecret_refresh_dev_change_me_barberia_2025',
        expiresIn: refreshExpiresIn 
      }
    );

    // Guardar refresh token en BD
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshExpiresIn);
    
    await this.prisma.refreshToken.create({
      data: {
        token: refresh_token,
        usuarioId: sub,
        expiresAt,
        revocado: false,
      },
    });

    return { access_token, refresh_token };
  }
}
