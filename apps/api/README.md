<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API REST para sistema de gestión de barbería construida con [NestJS](https://github.com/nestjs/nest) y TypeScript.

### Características principales

- 🔐 Autenticación JWT con refresh tokens persistidos en BD
- 🔒 Autorización basada en roles (ADMIN, BARBERO, CLIENTE)
- 📚 Documentación automática con Swagger/OpenAPI
- 🗄️ Base de datos PostgreSQL con Prisma ORM
- ✅ Testing completo (unitario y E2E)
- 🛡️ Validación de datos con class-validator

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barberia_db?schema=public"

# JWT Secrets
JWT_SECRET="supersecret_dev_change_me_barberia_2025"
JWT_EXPIRES=86400                    # 24 horas en segundos
JWT_REFRESH_SECRET="supersecret_refresh_dev_change_me_barberia_2025"
JWT_REFRESH_EXPIRES=604800           # 7 días en segundos

# Aplicación
PORT=3000
```

## Instalación y configuración

### 1. Instalar dependencias

```bash
$ pnpm install
```

### 2. Configurar base de datos

Asegúrate de tener PostgreSQL corriendo (puedes usar Docker):

```bash
# Desde la raíz del proyecto
$ cd ../../infra
$ docker-compose up -d
```

### 3. Ejecutar migraciones de Prisma

```bash
$ npx prisma migrate deploy
$ npx prisma generate
```

### 4. (Opcional) Abrir Prisma Studio

```bash
$ npx prisma studio
```

## Ejecutar la aplicación

```bash
# Modo desarrollo
$ pnpm run start:dev

# Modo producción
$ pnpm run build
$ pnpm run start:prod
```

La API estará disponible en `http://localhost:3000`

Documentación Swagger: `http://localhost:3000/api`

## Testing

### Tests Unitarios

Los tests unitarios verifican la lógica de negocio de forma aislada usando mocks:

```bash
# Ejecutar todos los tests unitarios
$ pnpm run test

# Ejecutar tests en modo watch (desarrollo)
$ pnpm run test:watch

# Ejecutar tests con cobertura
$ pnpm run test:cov

# Ejecutar un archivo específico
$ pnpm run test auth.service.spec.ts
```

**Tests unitarios disponibles:**
- `auth.service.spec.ts` - Servicio de autenticación (signup, login, refresh, logout)
- `agendas.service.spec.ts` - Servicio de agendas (CRUD completo)
- `jwt.guard.spec.ts` - Guard de autenticación JWT
- `roles.guard.spec.ts` - Guard de autorización por roles

### Tests E2E (End-to-End)

Los tests E2E prueban la aplicación completa simulando peticiones HTTP reales:

```bash
# Ejecutar todos los tests E2E
$ pnpm run test:e2e

# Ejecutar un archivo E2E específico
$ pnpm run test:e2e -- auth.e2e-spec.ts
```

**Tests E2E disponibles:**
- `auth.e2e-spec.ts` - Endpoints de autenticación
  - POST /auth/signup
  - POST /auth/login
  - GET /auth/me
  - POST /auth/refresh
  - POST /auth/logout
  
- `agendas.e2e-spec.ts` - Endpoints de agendas
  - POST /agendas
  - GET /agendas
  - GET /agendas/:id
  - GET /agendas/completed
  - GET /agendas/pending
  - PATCH /agendas/:id
  - PATCH /agendas/:id/toggle-complete
  - DELETE /agendas/:id
  - GET /agendas/admin/all (requiere rol ADMIN)

### Cobertura de tests

```bash
# Generar reporte de cobertura
$ pnpm run test:cov
```

El reporte se generará en `coverage/lcov-report/index.html`

### Debugging de tests

```bash
# Debug de tests unitarios
$ pnpm run test:debug

# Luego conecta tu debugger a localhost:9229
```

### Buenas prácticas de testing implementadas

✅ **Aislamiento**: Cada test es independiente y no afecta a otros  
✅ **Mocks**: Se usan mocks para dependencias externas (BD, servicios)  
✅ **Arrange-Act-Assert**: Estructura clara en cada test  
✅ **Casos edge**: Tests para casos de error y validaciones  
✅ **Limpieza**: Los tests E2E limpian datos de prueba después de ejecutarse  
✅ **Nombrado descriptivo**: Los tests describen claramente qué prueban

### Documentación adicional de testing

📚 Para guías detalladas y ejemplos, consulta:
- [TESTING.md](./TESTING.md) - Guía completa de testing
- [TESTING_EXAMPLES.md](./TESTING_EXAMPLES.md) - Ejemplos prácticos paso a paso

## Estructura del proyecto

```
apps/api/
├── prisma/
│   ├── schema.prisma              # Esquema de base de datos
│   └── migrations/                # Migraciones de Prisma
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Módulo principal
│   ├── prisma.service.ts          # Servicio de Prisma
│   ├── auth/                      # Módulo de autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts   # Tests unitarios
│   │   ├── jwt.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.guard.ts
│   │   └── dto/                   # Data Transfer Objects
│   ├── agendas/                   # Módulo de agendas
│   │   ├── agendas.controller.ts
│   │   ├── agendas.service.ts
│   │   ├── agendas.service.spec.ts
│   │   └── dto/
│   ├── barberos/                  # Módulo de barberos
│   ├── servicios/                 # Módulo de servicios
│   └── usuarios/                  # Módulo de usuarios
├── test/
│   ├── jest-e2e.json              # Config de Jest E2E
│   ├── auth.e2e-spec.ts           # Tests E2E de Auth
│   └── agendas.e2e-spec.ts        # Tests E2E de Agendas
├── .env                           # Variables de entorno
├── README.md                      # Este archivo
├── TESTING.md                     # Guía de testing
└── TESTING_EXAMPLES.md            # Ejemplos de testing
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
