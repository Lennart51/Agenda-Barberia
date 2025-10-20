import { Module } from '@nestjs/common';
import { BarberosService } from './barberos.service';
import { BarberosController } from './barberos.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BarberosController],
  providers: [BarberosService],
  exports: [BarberosService]
})
export class BarberosModule {}