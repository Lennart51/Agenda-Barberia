import { Module, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { PrismaModule } from './prisma.module';
import { BarberosModule } from './barberos/barberos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [PrismaModule, BarberosModule, UsuariosModule, TasksModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

