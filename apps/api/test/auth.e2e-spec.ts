import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (userId) {
      await prisma.usuario.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      // Esperar un poco para evitar conflictos de tiempo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `test.${Date.now()}.${Math.random()}@example.com`,
          password: 'password123',
          nombreCompleto: 'Usuario Test',
          telefono: '+56912345678',
          rol: 'CLIENTE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('usuario');
          expect(res.body.usuario).toHaveProperty('id');
          expect(res.body.usuario).toHaveProperty('email');
          expect(res.body.usuario.nombreCompleto).toBe('Usuario Test');
          
          // Guardar para tests posteriores
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
          userId = res.body.usuario.id;
        });
    });

    it('debe fallar con email duplicado', async () => {
      const email = `duplicate.${Date.now()}.${Math.random()}@example.com`;
      
      // Primer registro exitoso
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: 'password123',
          nombreCompleto: 'Usuario 1',
        })
        .expect(201);

      // Esperar un poco antes del segundo intento
      await new Promise(resolve => setTimeout(resolve, 100));

      // Segundo registro debe fallar
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: 'password123',
          nombreCompleto: 'Usuario 2',
        })
        .expect(409);
    });

    it('debe fallar con datos inválidos', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: '123', // muy corta
          nombreCompleto: '',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const testEmail = `login.${Date.now()}.${Math.random()}@example.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
      // Crear usuario para pruebas de login
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          nombreCompleto: 'Usuario Login Test',
        });
      
      // Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('debe iniciar sesión con credenciales válidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('usuario');
          expect(res.body.usuario.email).toBe(testEmail);
        });
    });

    it('debe fallar con email incorrecto', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: testPassword,
        })
        .expect(401);
    });

    it('debe fallar con contraseña incorrecta', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('debe retornar información del usuario autenticado', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('nombreCompleto');
          expect(res.body).toHaveProperty('rol');
        });
    });

    it('debe fallar sin token de autenticación', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('debe fallar con token inválido', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('debe generar nuevos tokens con refresh token válido', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(201) // El endpoint devuelve 201 Created
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          
          // Actualizar tokens para tests posteriores
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('debe fallar con refresh token inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: 'token_invalido',
        })
        .expect(401);
    });

    it('debe fallar sin refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('debe cerrar sesión exitosamente', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refresh_token: refreshToken,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Sesión cerrada exitosamente');
        });
    });

    it('debe fallar sin token de autenticación', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({
          refresh_token: refreshToken,
        })
        .expect(401);
    });
  });
});
