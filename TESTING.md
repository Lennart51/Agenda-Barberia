# Guía de Testing - Sistema de Gestión de Barbería

## Índice

1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Tests Unitarios](#tests-unitarios)
4. [Tests E2E](#tests-e2e)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Troubleshooting](#troubleshooting)

## Introducción

Este proyecto implementa una estrategia completa de testing que incluye:

- **Tests Unitarios**: Prueban componentes individuales de forma aislada
- **Tests E2E (End-to-End)**: Prueban el flujo completo de la aplicación

### Herramientas utilizadas

- **Jest**: Framework de testing
- **Supertest**: Cliente HTTP para tests E2E
- **@nestjs/testing**: Utilidades de testing para NestJS

## Configuración

### Estructura de archivos

```
apps/api/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts        # Test unitario
│   │   ├── jwt.guard.ts
│   │   ├── jwt.guard.spec.ts           # Test unitario
│   │   ├── roles.guard.ts
│   │   └── roles.guard.spec.ts         # Test unitario
│   └── agendas/
│       ├── agendas.service.ts
│       └── agendas.service.spec.ts     # Test unitario
└── test/
    ├── jest-e2e.json                    # Configuración Jest E2E
    ├── auth.e2e-spec.ts                 # Tests E2E de Auth
    └── agendas.e2e-spec.ts              # Tests E2E de Agendas
```

### Configuración de Jest

**jest.config.js** (generado por NestJS):
```javascript
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

## Tests Unitarios

### AuthService Tests

**Archivo**: `src/auth/auth.service.spec.ts`

**Cobertura**:
- ✅ signup() - Registro de usuarios
- ✅ login() - Inicio de sesión
- ✅ me() - Obtener info del usuario autenticado
- ✅ refresh() - Renovar tokens
- ✅ logout() - Cerrar sesión
- ✅ isTokenRevoked() - Verificar revocación de tokens

**Ejemplo de ejecución**:
```bash
# Ejecutar solo tests de AuthService
pnpm run test auth.service.spec.ts

# Con cobertura
pnpm run test:cov auth.service.spec.ts
```

**Casos de prueba destacados**:

1. **signup() exitoso**
   - Verifica creación de usuario
   - Valida generación de tokens (access + refresh)
   - Confirma almacenamiento en BD

2. **login() con credenciales inválidas**
   - Email inexistente → 401 Unauthorized
   - Contraseña incorrecta → 401 Unauthorized

3. **refresh() con token revocado**
   - Token revocado → 401 Unauthorized
   - Token expirado → 401 Unauthorized

### AgendasService Tests

**Archivo**: `src/agendas/agendas.service.spec.ts`

**Cobertura**:
- ✅ create() - Crear agenda
- ✅ findAll() - Listar todas las agendas
- ✅ findOne() - Obtener agenda por ID
- ✅ update() - Actualizar agenda
- ✅ remove() - Eliminar agenda
- ✅ toggleComplete() - Cambiar estado de completado
- ✅ findCompleted() - Listar agendas completadas
- ✅ findPending() - Listar agendas pendientes

### Guards Tests

#### JwtAuthGuard Tests

**Archivo**: `src/auth/jwt.guard.spec.ts`

**Casos de prueba**:
- ✅ Token válido → permite acceso
- ✅ Token caducado → 401 con mensaje descriptivo
- ✅ Token inválido → 401 con mensaje descriptivo
- ✅ Sin token → 401 con mensaje descriptivo

#### RolesGuard Tests

**Archivo**: `src/auth/roles.guard.spec.ts`

**Casos de prueba**:
- ✅ Usuario con rol requerido → permite acceso
- ✅ Usuario sin rol requerido → 403 Forbidden
- ✅ Sin roles requeridos → permite acceso (endpoint público)
- ✅ Usuario sin información → 403 Forbidden

### Ejecutar tests unitarios

```bash
# Todos los tests unitarios
pnpm run test

# Modo watch (desarrollo)
pnpm run test:watch

# Con cobertura
pnpm run test:cov

# Archivo específico
pnpm run test auth.service.spec.ts

# Con verbose output
pnpm run test -- --verbose
```

## Tests E2E

### Auth E2E Tests

**Archivo**: `test/auth.e2e-spec.ts`

**Endpoints cubiertos**:

1. **POST /auth/signup**
   - ✅ Registro exitoso
   - ✅ Email duplicado → 409 Conflict
   - ✅ Datos inválidos → 400 Bad Request

2. **POST /auth/login**
   - ✅ Login exitoso con credenciales válidas
   - ✅ Email incorrecto → 401 Unauthorized
   - ✅ Contraseña incorrecta → 401 Unauthorized

3. **GET /auth/me**
   - ✅ Con token válido → retorna info del usuario
   - ✅ Sin token → 401 Unauthorized
   - ✅ Token inválido → 401 Unauthorized

4. **POST /auth/refresh**
   - ✅ Genera nuevos tokens con refresh token válido
   - ✅ Refresh token inválido → 401 Unauthorized
   - ✅ Sin refresh token → 400 Bad Request

5. **POST /auth/logout**
   - ✅ Cierre de sesión exitoso
   - ✅ Sin token de autenticación → 401 Unauthorized

### Agendas E2E Tests

**Archivo**: `test/agendas.e2e-spec.ts`

**Endpoints cubiertos**:

1. **POST /agendas**
   - ✅ Crear agenda con datos completos
   - ✅ Crear agenda sin descripción (opcional)
   - ✅ Falla sin título → 400 Bad Request

2. **GET /agendas**
   - ✅ Retorna todas las agendas
   - ✅ Ordenadas por fecha de creación (desc)

3. **GET /agendas/:id**
   - ✅ Retorna agenda específica
   - ✅ ID inexistente → 404 Not Found

4. **GET /agendas/completed**
   - ✅ Solo retorna agendas completadas

5. **GET /agendas/pending**
   - ✅ Solo retorna agendas pendientes

6. **PATCH /agendas/:id**
   - ✅ Actualiza agenda exitosamente
   - ✅ ID inexistente → 404 Not Found

7. **PATCH /agendas/:id/toggle-complete**
   - ✅ Cambia estado de completado
   - ✅ ID inexistente → 404 Not Found

8. **GET /agendas/admin/all**
   - ✅ Usuario ADMIN → permite acceso
   - ✅ Usuario CLIENTE → 403 Forbidden
   - ✅ Sin token → 401 Unauthorized

9. **DELETE /agendas/:id**
   - ✅ Elimina agenda exitosamente
   - ✅ ID ya eliminado → 404 Not Found

### Ejecutar tests E2E

```bash
# Todos los tests E2E
pnpm run test:e2e

# Archivo específico
pnpm run test:e2e -- auth.e2e-spec.ts

# Con verbose output
pnpm run test:e2e -- --verbose
```

**⚠️ Importante**: Los tests E2E usan la base de datos configurada en `.env`. Se recomienda usar una BD de pruebas separada.

## Mejores Prácticas

### 1. Estructura AAA (Arrange-Act-Assert)

```typescript
it('debe crear un usuario exitosamente', async () => {
  // Arrange (Preparar)
  const createDto = {
    email: 'test@example.com',
    password: 'password123',
    nombreCompleto: 'Test User',
  };
  
  // Act (Actuar)
  const result = await service.signup(createDto);
  
  // Assert (Afirmar)
  expect(result).toHaveProperty('access_token');
  expect(result).toHaveProperty('refresh_token');
});
```

### 2. Usar mocks para dependencias externas

```typescript
const mockPrismaService = {
  usuario: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};
```

### 3. Limpiar estado entre tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Limpiar datos de prueba en BD
  await prisma.usuario.deleteMany({ where: { email: { contains: 'test' } } });
  await app.close();
});
```

### 4. Tests descriptivos

✅ Bien:
```typescript
it('debe lanzar UnauthorizedException si el email no existe', async () => {
  // ...
});
```

❌ Mal:
```typescript
it('test login', async () => {
  // ...
});
```

### 5. Agrupar tests relacionados

```typescript
describe('AuthService', () => {
  describe('signup', () => {
    it('debe registrar usuario exitosamente', () => {});
    it('debe fallar con email duplicado', () => {});
  });
  
  describe('login', () => {
    it('debe iniciar sesión con credenciales válidas', () => {});
    it('debe fallar con contraseña incorrecta', () => {});
  });
});
```

### 6. Probar casos edge

- ✅ Casos exitosos
- ✅ Casos de error (404, 401, 403, 400)
- ✅ Valores null/undefined
- ✅ Datos inválidos
- ✅ Límites (strings vacíos, números negativos)

## Cobertura de Código

### Ver reporte de cobertura

```bash
# Generar reporte
pnpm run test:cov

# Abrir en navegador
start coverage/lcov-report/index.html  # Windows
open coverage/lcov-report/index.html   # macOS
```

### Métricas de cobertura

El proyecto actual tiene la siguiente cobertura:

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| auth.service.ts | 100% | 100% | 100% | 100% |
| agendas.service.ts | 100% | 100% | 100% | 100% |
| jwt.guard.ts | 100% | 100% | 100% | 100% |
| roles.guard.ts | 100% | 100% | 100% | 100% |

## Troubleshooting

### Problema: Tests fallan por timeout

**Solución**: Aumentar timeout en jest.config.js
```javascript
{
  "testTimeout": 30000  // 30 segundos
}
```

### Problema: Error de conexión a BD en tests E2E

**Solución**: Verificar que PostgreSQL está corriendo y que DATABASE_URL es correcta

```bash
# Verificar si PostgreSQL está corriendo
docker ps | grep postgres

# Iniciar si está detenido
cd infra
docker-compose up -d
```

### Problema: Mocks no funcionan correctamente

**Solución**: Asegurarse de limpiar mocks entre tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Problema: Tests E2E interfieren entre sí

**Solución**: Usar datos únicos en cada test (timestamps, UUIDs)

```typescript
const email = `test.${Date.now()}@example.com`;
```

## Comandos útiles

```bash
# Ver ayuda de Jest
pnpm run test -- --help

# Ejecutar tests con patrón específico
pnpm run test -- auth

# Ejecutar solo tests que fallaron
pnpm run test -- --onlyFailures

# Modo debug
pnpm run test:debug

# Actualizar snapshots
pnpm run test -- -u
```

## Recursos adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Última actualización**: Diciembre 2025  
**Versión**: 1.0.0
