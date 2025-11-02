import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicioDto: CreateServicioDto, userId: string) {
    return this.prisma.servicio.create({
      data: {
        ...createServicioDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.servicio.findMany({
      where: { userId },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const servicio = await this.prisma.servicio.findFirst({
      where: { id, userId },
    });
    
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado o no tienes permiso para verlo');
    }
    
    return servicio;
  }

  async update(id: string, updateServicioDto: UpdateServicioDto, userId: string) {
    // Verificar que el servicio existe y pertenece al usuario
    await this.findOne(id, userId);
    
    return this.prisma.servicio.update({
      where: { id },
      data: updateServicioDto,
    });
  }

  async remove(id: string, userId: string) {
    // Verificar que el servicio existe y pertenece al usuario
    await this.findOne(id, userId);
    
    return this.prisma.servicio.delete({
      where: { id },
    });
  }
}
