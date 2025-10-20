# Sistema de Agenda para Barbería

## Descripción del Proyecto

Sistema de gestión de citas para barbería que permite administrar clientes, servicios y horarios de manera eficiente.

### Stakeholders
- Dueños de barberías
- Barberos/estilistas
- Clientes
- Administradores

### Alcance MVP
- Gestión de citas (CRUD)
- Control de horarios comerciales
- Asignación de servicios
- Interfaz web responsiva
- API REST documentada

## Estado de Implementación ✅

### 1. Estructura del Proyecto - Monorepo con pnpm
```
agenda/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend
├── infra/            # Configuraciones Docker
└── pnpm-workspace.yaml
```

### 2. Base de Datos en Docker
```yaml
services:
  db_agenda:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
```

### 3. Configuración de Entorno
```
# Ejemplo de configuración (usar .env para valores reales)
DATABASE_URL="postgresql://[usuario]:[contraseña]@localhost:5433/db_agenda?schema=public"
```

### 4. Seguridad y Validaciones
- CORS habilitado
- ValidationPipe global implementado
- Validación de datos en endpoints

### 5. Documentación API con Swagger
- Disponible en `/api/docs`
- Documentación automática de endpoints
- Interfaz UI interactiva

### 6. Base de Datos con Prisma
```prisma
model Appointment {
  id          Int      @id @default(autoincrement())
  clientName  String
  serviceId   Int
  date        DateTime
  status      String
  createdAt   DateTime @default(now())
}
```

### 7. CRUD con Paginación
```typescript
async findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return {
    data: await this.prisma.appointment.findMany({
      skip,
      take: limit,
      include: { service: true }
    }),
    meta: { page, limit }
  };
}
```

### 8. DTOs y Validaciones
```typescript
export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  clientName: string;
  
  @IsDateString()
  @IsInBusinessHours()
  date: DateTime;
}
```

## Puertos y Servicios

| Servicio    | Puerto | URL                    |
|-------------|--------|------------------------|
| API NestJS  | 3000   | http://localhost:3000  |
| PostgreSQL  | 5433   | localhost:5433         |
| Swagger     | 3000   | /api/docs              |

## Instalación y Configuración

### Prerrequisitos
- Node.js
- pnpm
- Docker
- Docker Compose

### Pasos de Activación

1. **Base de Datos:**
   ```bash
   cd infra
   docker compose up -d
   ```

2. **Backend:**
   ```bash
   cd apps/api
   pnpm install
   npx prisma generate
   npx prisma migrate deploy
   pnpm dev:api
   ```

## Funcionamiento del Sistema

### Flujo de una Petición
1. Cliente hace request → CORS verifica origen
2. ValidationPipe valida datos
3. Controller recibe petición
4. Service procesa lógica de negocio
5. PrismaService interactúa con base de datos
6. Respuesta vuelve al cliente

### Paginación
- `skip = (página - 1) * límite`
- `take = límite`
- **Ejemplo:** página 2, límite 10 → skip 10, trae siguientes 10 registros

### Validaciones Implementadas
- `@IsNotEmpty` → campos requeridos
- `@IsString` → tipo string
- `@IsDateString` → formato fecha válido
- `@IsInBusinessHours` → horario comercial válido

## Estructura de la Base de Datos

El sistema utiliza PostgreSQL con los siguientes modelos principales:
- **Appointment**: Gestión de citas
- **Service**: Catálogo de servicios

