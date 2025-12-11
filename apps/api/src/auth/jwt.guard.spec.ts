import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('debe estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('debe retornar el usuario si es válido', () => {
      const user = { sub: 'user-id', email: 'test@example.com', rol: 'CLIENTE' };

      const result = guard.handleRequest(null, user, null);

      expect(result).toEqual(user);
    });

    it('debe lanzar UnauthorizedException si el token está caducado', () => {
      const info = { name: 'TokenExpiredError' };

      expect(() => guard.handleRequest(null, null, info)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info)).toThrow(
        'Token caducado. Por favor, renueve su token usando /auth/refresh o inicie sesión nuevamente.'
      );
    });

    it('debe lanzar UnauthorizedException si el token es inválido', () => {
      const info = { name: 'JsonWebTokenError' };

      expect(() => guard.handleRequest(null, null, info)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info)).toThrow(
        'Token inválido. Por favor, proporcione un token válido.'
      );
    });

    it('debe lanzar UnauthorizedException si no se proporciona token', () => {
      const info = { message: 'No auth token' };

      expect(() => guard.handleRequest(null, null, info)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info)).toThrow(
        'No se proporcionó token de autenticación. Incluya el header: Authorization: Bearer <token>'
      );
    });

    it('debe lanzar UnauthorizedException si no hay usuario', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Acceso no autorizado. Token inválido o ausente.'
      );
    });

    it('debe propagar el error si existe', () => {
      const error = new Error('Error personalizado');

      expect(() => guard.handleRequest(error, null, null)).toThrow(error);
    });
  });

  describe('canActivate', () => {
    it('debe estar definido el método canActivate', () => {
      expect(guard.canActivate).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });
  });
});
