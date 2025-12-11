import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('debe estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('debe permitir acceso si no hay roles requeridos', () => {
      const mockContext = createMockContext({ rol: 'CLIENTE' });
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('debe permitir acceso si el usuario tiene el rol requerido', () => {
      const mockContext = createMockContext({ rol: 'ADMIN' });
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('debe permitir acceso si el usuario tiene uno de los roles requeridos', () => {
      const mockContext = createMockContext({ rol: 'BARBERO' });
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN', 'BARBERO']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('debe denegar acceso si el usuario no tiene el rol requerido', () => {
      const mockContext = createMockContext({ rol: 'CLIENTE' });
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Acceso denegado. Se requiere uno de los siguientes roles: ADMIN. Tu rol actual es: CLIENTE'
      );
    });

    it('debe denegar acceso si no hay información del usuario', () => {
      const mockContext = createMockContext(null);
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'No se encontró información del usuario. Token inválido.'
      );
    });

    it('debe denegar acceso si el usuario no tiene rol definido', () => {
      const mockContext = createMockContext({ rol: undefined });
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Acceso denegado. Se requiere uno de los siguientes roles: ADMIN. Tu rol actual es: ninguno'
      );
    });

    it('debe manejar múltiples roles requeridos correctamente', () => {
      const mockContext = createMockContext({ rol: 'CLIENTE' });
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN', 'BARBERO']);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Acceso denegado. Se requiere uno de los siguientes roles: ADMIN, BARBERO. Tu rol actual es: CLIENTE'
      );
    });
  });

  // Función helper para crear mock del contexto
  function createMockContext(user: any): ExecutionContext {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  }
});
