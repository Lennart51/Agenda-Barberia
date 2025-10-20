import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// La clase PrismaService extiende PrismaClient, que es el cliente auto-generado por Prisma.
// Esto nos permite usar las operaciones de base de datos directamente en nuestras clases de servicio.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    
    // conexion con la base de datos
    async onModuleInit() {
        await this.$connect();
    }

    // desconectar la base de datos
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
