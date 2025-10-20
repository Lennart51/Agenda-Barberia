import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// El módulo PrismaModule encapsula el PrismaService y lo configura como un módulo global.
// Esto permite usarlo en cualquier archivo
@Global()
@Module({
 providers: [PrismaService],
 exports: [PrismaService],
})
export class PrismaModule {}