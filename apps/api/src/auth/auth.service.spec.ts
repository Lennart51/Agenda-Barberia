import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: UsuariosService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockUsuario = {
    id: 'user-id-123',
    email: 'test@example.com',
    contrasena: 'hashed_password',
    nombreCompleto: 'Usuario Test',
    telefono: '+56912345678',
    rol: 'CLIENTE',
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  };

  const mockUsuariosService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test_secret',
        JWT_EXPIRES: 86400,
        JWT_REFRESH_SECRET: 'test_refresh_secret',
        JWT_REFRESH_EXPIRES: 604800,
      };
      return config[key as keyof typeof config];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    // Limpiar mocks
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const nombreCompleto = 'Nuevo Usuario';
      const telefono = '+56912345678';
      const rol = 'CLIENTE';

      mockUsuariosService.create.mockResolvedValue(mockUsuario);
      mockJwtService.sign.mockReturnValueOnce('access_token_mock');
      mockJwtService.sign.mockReturnValueOnce('refresh_token_mock');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id',
        token: 'refresh_token_mock',
        usuarioId: mockUsuario.id,
        expiresAt: new Date(),
        revocado: false,
      });

      const result = await service.signup(email, password, nombreCompleto, telefono, rol);

      expect(result).toHaveProperty('access_token', 'access_token_mock');
      expect(result).toHaveProperty('refresh_token', 'refresh_token_mock');
      expect(result).toHaveProperty('usuario');
      expect(result.usuario).toHaveProperty('id', mockUsuario.id);
      expect(result.usuario).toHaveProperty('email', mockUsuario.email);
      expect(mockUsuariosService.create).toHaveBeenCalledWith(
        email,
        password,
        nombreCompleto,
        telefono,
        rol
      );
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });

    it('debe propagar error si el email ya existe', async () => {
      mockUsuariosService.create.mockRejectedValue(
        new ConflictException('El email ya está registrado')
      );

      await expect(
        service.signup('existing@example.com', 'password123', 'Usuario')
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe iniciar sesión con credenciales válidas', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUsuariosService.findByEmail.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('access_token_mock');
      mockJwtService.sign.mockReturnValueOnce('refresh_token_mock');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id',
        token: 'refresh_token_mock',
        usuarioId: mockUsuario.id,
        expiresAt: new Date(),
        revocado: false,
      });

      const result = await service.login(email, password);

      expect(result).toHaveProperty('access_token', 'access_token_mock');
      expect(result).toHaveProperty('refresh_token', 'refresh_token_mock');
      expect(result).toHaveProperty('usuario');
      expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUsuario.contrasena);
    });

    it('debe fallar con email inexistente', async () => {
      mockUsuariosService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('noexiste@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe fallar con contraseña incorrecta', async () => {
      mockUsuariosService.findByEmail.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('debe retornar información del usuario', async () => {
      mockUsuariosService.findById.mockResolvedValue(mockUsuario);

      const result = await service.me(mockUsuario.id);

      expect(result).toHaveProperty('id', mockUsuario.id);
      expect(result).toHaveProperty('email', mockUsuario.email);
      expect(result).toHaveProperty('nombreCompleto', mockUsuario.nombreCompleto);
      expect(result).toHaveProperty('rol', mockUsuario.rol);
      expect(mockUsuariosService.findById).toHaveBeenCalledWith(mockUsuario.id);
    });

    it('debe fallar si el usuario no existe', async () => {
      mockUsuariosService.findById.mockResolvedValue(null);

      await expect(service.me('user-id-inexistente')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('refresh', () => {
    const mockRefreshToken = 'valid_refresh_token';
    const mockTokenRecord = {
      id: 'token-id',
      token: mockRefreshToken,
      usuarioId: mockUsuario.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
      revocado: false,
      usuario: mockUsuario,
    };

    it('debe generar nuevos tokens con refresh token válido', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockTokenRecord);
      mockJwtService.verify.mockReturnValue({ sub: mockUsuario.id, email: mockUsuario.email });
      mockJwtService.sign.mockReturnValueOnce('new_access_token');
      mockJwtService.sign.mockReturnValueOnce('new_refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'new-token-id',
        token: 'new_refresh_token',
        usuarioId: mockUsuario.id,
        expiresAt: new Date(),
        revocado: false,
      });
      mockPrismaService.refreshToken.update.mockResolvedValue({
        ...mockTokenRecord,
        revocado: true,
      });

      const result = await service.refresh(mockRefreshToken);

      expect(result).toHaveProperty('access_token', 'new_access_token');
      expect(result).toHaveProperty('refresh_token', 'new_refresh_token');
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockTokenRecord.id },
        data: { revocado: true },
      });
    });

    it('debe fallar con token inexistente en BD', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('token_inexistente')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('debe fallar con token revocado', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        ...mockTokenRecord,
        revocado: true,
      });

      await expect(service.refresh(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('debe fallar con token expirado', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        ...mockTokenRecord,
        expiresAt: new Date(Date.now() - 1000), // Expirado
      });

      await expect(service.refresh(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('logout', () => {
    it('debe revocar el refresh token exitosamente', async () => {
      const refreshToken = 'valid_refresh_token';
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('access_token', refreshToken);

      expect(result).toHaveProperty('message', 'Sesión cerrada exitosamente');
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
        data: { revocado: true },
      });
    });

    it('debe funcionar incluso si el token no existe', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.logout('access_token', 'token_inexistente');

      expect(result).toHaveProperty('message', 'Sesión cerrada exitosamente');
    });
  });

  describe('isTokenRevoked', () => {
    it('debe retornar true si el token está revocado', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        token: 'token',
        revocado: true,
      });

      const result = await service.isTokenRevoked('token');

      expect(result).toBe(true);
    });

    it('debe retornar false si el token no está revocado', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        token: 'token',
        revocado: false,
      });

      const result = await service.isTokenRevoked('token');

      expect(result).toBe(false);
    });

    it('debe retornar false si el token no existe', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      const result = await service.isTokenRevoked('token_inexistente');

      expect(result).toBe(false);
    });
  });
});
