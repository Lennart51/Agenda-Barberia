import { Module, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { PrismaModule } from './prisma.module';
import { BarberosModule } from './barberos/barberos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AgendasModule } from './agendas/agendas.module';
import { ServiciosModule } from './servicios/servicios.module';

@Module({
  imports: [PrismaModule, BarberosModule, UsuariosModule, AgendasModule, ServiciosModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

