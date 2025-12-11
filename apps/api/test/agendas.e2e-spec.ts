import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Agendas Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let adminToken: string;
  let agendaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // Crear usuario cliente para pruebas
    const clienteRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `cliente.${Date.now()}@example.com`,
        password: 'password123',
        nombreCompleto: 'Cliente Test',
        rol: 'CLIENTE',
      });
    
    accessToken = clienteRes.body.access_token;

    // Crear usuario admin para pruebas
    const adminRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `admin.${Date.now()}@example.com`,
        password: 'password123',
        nombreCompleto: 'Admin Test',
        rol: 'ADMIN',
      });
    
    adminToken = adminRes.body.access_token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (agendaId) {
      await prisma.agenda.delete({ where: { id: agendaId } }).catch(() => {});
    }
    await app.close();
  });

  describe('POST /agendas', () => {
    it('debe crear una nueva agenda exitosamente', () => {
      return request(app.getHttpServer())
        .post('/agendas')
        .send({
          title: 'Agenda de prueba',
          description: 'Descripción de la agenda de prueba',
          completed: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', 'Agenda de prueba');
          expect(res.body).toHaveProperty('description', 'Descripción de la agenda de prueba');
          expect(res.body).toHaveProperty('completed', false);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          
          // Guardar ID para tests posteriores
          agendaId = res.body.id;
        });
    });

    it('debe crear agenda sin descripción', () => {
      return request(app.getHttpServer())
        .post('/agendas')
        .send({
          title: 'Agenda sin descripción',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Agenda sin descripción');
          expect(res.body.description).toBeNull();
        });
    });

    it('debe fallar sin título', () => {
      return request(app.getHttpServer())
        .post('/agendas')
        .send({
          description: 'Solo descripción',
        })
        .expect(400);
    });
  });

  describe('GET /agendas', () => {
    it('debe obtener todas las agendas', () => {
      return request(app.getHttpServer())
        .get('/agendas')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          
          const agenda = res.body[0];
          expect(agenda).toHaveProperty('id');
          expect(agenda).toHaveProperty('title');
          expect(agenda).toHaveProperty('completed');
        });
    });
  });

  describe('GET /agendas/:id', () => {
    it('debe obtener una agenda por ID', () => {
      return request(app.getHttpServer())
        .get(`/agendas/${agendaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', agendaId);
          expect(res.body).toHaveProperty('title');
        });
    });

    it('debe fallar con ID inexistente', () => {
      return request(app.getHttpServer())
        .get('/agendas/id_inexistente')
        .expect(404);
    });
  });

  describe('GET /agendas/completed', () => {
    it('debe obtener solo agendas completadas', () => {
      return request(app.getHttpServer())
        .get('/agendas/completed')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          // Verificar que todas estén completadas
          res.body.forEach((agenda: any) => {
            expect(agenda.completed).toBe(true);
          });
        });
    });
  });

  describe('GET /agendas/pending', () => {
    it('debe obtener solo agendas pendientes', () => {
      return request(app.getHttpServer())
        .get('/agendas/pending')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          // Verificar que todas estén pendientes
          res.body.forEach((agenda: any) => {
            expect(agenda.completed).toBe(false);
          });
        });
    });
  });

  describe('PATCH /agendas/:id', () => {
    it('debe actualizar una agenda exitosamente', () => {
      return request(app.getHttpServer())
        .patch(`/agendas/${agendaId}`)
        .send({
          title: 'Título actualizado',
          description: 'Descripción actualizada',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', agendaId);
          expect(res.body).toHaveProperty('title', 'Título actualizado');
          expect(res.body).toHaveProperty('description', 'Descripción actualizada');
        });
    });

    it('debe fallar con ID inexistente', () => {
      return request(app.getHttpServer())
        .patch('/agendas/id_inexistente')
        .send({
          title: 'Nuevo título',
        })
        .expect(404);
    });
  });

  describe('PATCH /agendas/:id/toggle-complete', () => {
    it('debe marcar agenda como completada', async () => {
      // Primero obtener estado actual
      const current = await request(app.getHttpServer())
        .get(`/agendas/${agendaId}`);
      
      const wasCompleted = current.body.completed;

      // Toggle del estado
      return request(app.getHttpServer())
        .patch(`/agendas/${agendaId}/toggle-complete`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', agendaId);
          expect(res.body.completed).toBe(!wasCompleted);
        });
    });

    it('debe fallar con ID inexistente', () => {
      return request(app.getHttpServer())
        .patch('/agendas/id_inexistente/toggle-complete')
        .expect(404);
    });
  });

  describe('GET /agendas/admin/all', () => {
    it('debe permitir acceso a usuarios ADMIN', () => {
      return request(app.getHttpServer())
        .get('/agendas/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('debe denegar acceso a usuarios CLIENTE', () => {
      return request(app.getHttpServer())
        .get('/agendas/admin/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('debe fallar sin token de autenticación', () => {
      return request(app.getHttpServer())
        .get('/agendas/admin/all')
        .expect(401);
    });
  });

  describe('DELETE /agendas/:id', () => {
    it('debe eliminar una agenda exitosamente', () => {
      return request(app.getHttpServer())
        .delete(`/agendas/${agendaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', agendaId);
        });
    });

    it('debe fallar al eliminar agenda ya eliminada', () => {
      return request(app.getHttpServer())
        .delete(`/agendas/${agendaId}`)
        .expect(404);
    });

    it('debe fallar con ID inexistente', () => {
      return request(app.getHttpServer())
        .delete('/agendas/id_inexistente')
        .expect(404);
    });
  });
});
