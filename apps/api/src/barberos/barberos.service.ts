import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBarberoDto } from './dto/create-barbero.dto';
import { UpdateBarberoDto } from './dto/update-barbero.dto';

@Injectable()
export class BarberosService {
  constructor(private prisma: PrismaService) {}

  create(createBarberoDto: CreateBarberoDto) {
    return this.prisma.barbero.create({
      data: createBarberoDto,
      include: {
        usuario: true
      }
    });
  }

  findAll() {
    return this.prisma.barbero.findMany({
      include: {
        usuario: true,
        servicios: {
          include: {
            servicio: true
          }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.barbero.findUnique({
      where: { id },
      include: {
        usuario: true,
        servicios: {
          include: {
            servicio: true
          }
        },
        horarios: true
      }
    });
  }

  update(id: string, updateBarberoDto: UpdateBarberoDto) {
    return this.prisma.barbero.update({
      where: { id },
      data: updateBarberoDto,
      include: {
        usuario: true,
        servicios: {
          include: {
            servicio: true
          }
        },
        horarios: true
      }
    });
  }

  remove(id: string) {
    return this.prisma.barbero.delete({
      where: { id },
      include: {
        usuario: true
      }
    });
  }
}