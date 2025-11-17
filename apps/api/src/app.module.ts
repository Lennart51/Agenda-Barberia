import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './logger.middleware';
import { PrismaModule } from './prisma.module';
import { BarberosModule } from './barberos/barberos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AgendasModule } from './agendas/agendas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    BarberosModule, 
    UsuariosModule, 
    AgendasModule, 
    ServiciosModule, 
    AuthModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

