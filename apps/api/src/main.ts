import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Configuración de Swagger para la documentación de la API
  // Esto permite probar los endpoints y ver los esquemas de los DTOs
  const config = new DocumentBuilder()
    .setTitle('API Barbería')
    .setDescription('API para gestión de citas y servicios de barbería')
    .setVersion('1.0')
    .addTag('usuarios', 'Gestión de usuarios')
    .addTag('barberos', 'Gestión de barberos')
    .addTag('servicios', 'Gestión de servicios')
    .addTag('citas', 'Gestión de citas')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();


