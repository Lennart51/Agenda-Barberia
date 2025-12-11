# Ejemplos Prácticos de Testing

Este documento contiene ejemplos prácticos de cómo escribir y ejecutar tests en el proyecto.

## Ejemplo 1: Test Unitario Básico

### Servicio a probar
```typescript
// agendas.service.ts
async create(createAgendaDto: CreateAgendaDto) {
  return await this.prisma.agenda.create({
    data: createAgendaDto,
  });
}
```

### Test
```typescript
// agendas.service.spec.ts
it('debe crear una agenda exitosamente', async () => {
  // 1. Preparar datos de prueba
  const createDto = {
    title: 'Nueva Agenda',
    description: 'Descripción de prueba',
  };

  // 2. Configurar mock
  mockPrismaService.agenda.create.mockResolvedValue({
    id: 'agenda-123',
    ...createDto,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Ejecutar método
  const result = await service.create(createDto);

  // 4. Verificar resultado
  expect(result).toHaveProperty('id');
  expect(result.title).toBe(createDto.title);
  expect(mockPrismaService.agenda.create).toHaveBeenCalledWith({
    data: createDto,
  });
});
```

**Ejecutar**:
```bash
pnpm run test agendas.service.spec.ts
```

## Ejemplo 2: Test E2E de Endpoint

### Endpoint a probar
```typescript
// agendas.controller.ts
@Post()
create(@Body() createAgendaDto: CreateAgendaDto) {
  return this.agendasService.create(createAgendaDto);
}
```

### Test
```typescript
// agendas.e2e-spec.ts
it('debe crear una nueva agenda exitosamente', () => {
  return request(app.getHttpServer())
    .post('/agendas')
    .send({
      title: 'Agenda de prueba',
      description: 'Descripción de prueba',
    })
    .expect(201)
    .expect((res) => {
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Agenda de prueba');
      expect(res.body.completed).toBe(false);
    });
});
```

**Ejecutar**:
```bash
pnpm run test:e2e -- agendas.e2e-spec.ts
```

## Ejemplo 3: Test de Autenticación

### Flujo completo de autenticación

```typescript
describe('Flujo completo de autenticación', () => {
  let accessToken: string;
  let refreshToken: string;

  it('1. Registrar usuario', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'user@example.com',
        password: 'password123',
        nombreCompleto: 'Usuario Test',
      })
      .expect(201);

    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
    
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('2. Acceder a ruta protegida', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', 'user@example.com');
  });

  it('3. Renovar tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(200);

    // Actualizar tokens
    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('4. Cerrar sesión', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken })
      .expect(201);
  });
});
```

**Ejecutar**:
```bash
pnpm run test:e2e -- auth.e2e-spec.ts
```

## Ejemplo 4: Test de Autorización por Roles

### Guard a probar
```typescript
// roles.guard.ts
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
  const user = context.switchToHttp().getRequest().user;
  
  return requiredRoles.some((role) => user.rol === role);
}
```

### Test
```typescript
it('debe permitir acceso a usuario ADMIN', () => {
  const mockContext = createMockContext({ rol: 'ADMIN' });
  jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

  const result = guard.canActivate(mockContext);

  expect(result).toBe(true);
});

it('debe denegar acceso a usuario CLIENTE', () => {
  const mockContext = createMockContext({ rol: 'CLIENTE' });
  jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

  expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
});
```

**Ejecutar**:
```bash
pnpm run test roles.guard.spec.ts
```

## Ejemplo 5: Test de Manejo de Errores

### Probar diferentes tipos de errores

```typescript
describe('Manejo de errores', () => {
  it('debe lanzar NotFoundException si la agenda no existe', async () => {
    mockPrismaService.agenda.findUnique.mockResolvedValue(null);

    await expect(service.findOne('id-inexistente')).rejects.toThrow(
      NotFoundException
    );
    await expect(service.findOne('id-inexistente')).rejects.toThrow(
      'Agenda con ID id-inexistente no encontrada'
    );
  });

  it('debe lanzar BadRequestException si hay error de BD', async () => {
    mockPrismaService.agenda.create.mockRejectedValue(
      new Error('Error de conexión')
    );

    await expect(
      service.create({ title: 'Test' })
    ).rejects.toThrow(BadRequestException);
  });
});
```

## Ejemplo 6: Test con Múltiples Mocks

### Servicio con múltiples dependencias

```typescript
describe('AuthService con múltiples dependencias', () => {
  it('debe hacer login correctamente', async () => {
    // Mock de UsuariosService
    mockUsuariosService.findByEmail.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      contrasena: 'hashed_password',
      rol: 'CLIENTE',
    });

    // Mock de bcrypt
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Mock de JwtService
    mockJwtService.sign
      .mockReturnValueOnce('access_token')
      .mockReturnValueOnce('refresh_token');

    // Mock de PrismaService
    mockPrismaService.refreshToken.create.mockResolvedValue({
      id: 'token-123',
      token: 'refresh_token',
      usuarioId: 'user-123',
      expiresAt: new Date(),
      revocado: false,
    });

    // Ejecutar
    const result = await service.login('test@example.com', 'password123');

    // Verificar
    expect(result).toHaveProperty('access_token', 'access_token');
    expect(result).toHaveProperty('refresh_token', 'refresh_token');
    expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
  });
});
```

## Ejemplo 7: Test de Validación de DTOs

### DTO con validaciones

```typescript
// create-agenda.dto.ts
export class CreateAgendaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### Test E2E de validación

```typescript
describe('Validación de CreateAgendaDto', () => {
  it('debe fallar si falta el título', () => {
    return request(app.getHttpServer())
      .post('/agendas')
      .send({
        description: 'Solo descripción',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('title');
      });
  });

  it('debe fallar si el título no es string', () => {
    return request(app.getHttpServer())
      .post('/agendas')
      .send({
        title: 123, // número en lugar de string
        description: 'Descripción válida',
      })
      .expect(400);
  });

  it('debe aceptar agenda sin descripción', () => {
    return request(app.getHttpServer())
      .post('/agendas')
      .send({
        title: 'Solo título',
      })
      .expect(201);
  });
});
```

## Ejemplo 8: Test de Paginación (Futuro)

### Si implementas paginación

```typescript
describe('GET /agendas con paginación', () => {
  beforeAll(async () => {
    // Crear 25 agendas de prueba
    for (let i = 0; i < 25; i++) {
      await request(app.getHttpServer())
        .post('/agendas')
        .send({ title: `Agenda ${i}` });
    }
  });

  it('debe retornar primera página con 10 elementos', () => {
    return request(app.getHttpServer())
      .get('/agendas?page=1&limit=10')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(10);
        expect(res.body.meta.currentPage).toBe(1);
        expect(res.body.meta.totalPages).toBe(3);
      });
  });

  it('debe retornar segunda página', () => {
    return request(app.getHttpServer())
      .get('/agendas?page=2&limit=10')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(10);
        expect(res.body.meta.currentPage).toBe(2);
      });
  });
});
```

## Debugging de Tests

### 1. Modo debug en VS Code

Crea `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 2. Console.log en tests

```typescript
it('debe hacer algo', () => {
  const result = someFunction();
  console.log('Resultado:', result); // Para debug
  expect(result).toBe('esperado');
});
```

### 3. Test.only para ejecutar un solo test

```typescript
it.only('ejecutar solo este test', () => {
  // Este es el único test que se ejecutará
});
```

### 4. Test.skip para omitir un test

```typescript
it.skip('omitir este test temporalmente', () => {
  // Este test no se ejecutará
});
```

## Comandos útiles durante desarrollo

```bash
# Ejecutar tests que coincidan con un patrón
pnpm run test -- --testNamePattern="debe crear"

# Ejecutar tests de un archivo específico
pnpm run test auth.service.spec.ts

# Modo watch (re-ejecuta al guardar)
pnpm run test:watch

# Ver solo tests que fallaron
pnpm run test -- --onlyFailures

# Ejecutar con más detalle
pnpm run test -- --verbose

# Generar reporte de cobertura
pnpm run test:cov
```

## Tips finales

1. **Escribe el test antes de arreglar un bug** - Esto asegura que el bug no vuelva a aparecer
2. **Mantén los tests simples** - Un test debe probar una sola cosa
3. **Usa nombres descriptivos** - El nombre del test debe explicar qué hace
4. **No testees implementación** - Testea comportamiento, no cómo está implementado
5. **Limpia después de cada test** - Evita que los tests se afecten entre sí
6. **Usa factories para datos de prueba** - Reutiliza creación de objetos complejos
7. **Ejecuta tests frecuentemente** - En cada commit o al menos antes de push

---

**Recuerda**: Un buen test es aquel que falla cuando el código está roto y pasa cuando el código está bien.
