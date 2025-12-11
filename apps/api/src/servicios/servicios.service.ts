import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
      include: {
        usuario: {
          select: {
            nombreCompleto: true,
            email: true
          }
        }
      }
    });
  }

  async findAll(userId: string, userRole?: string) {
    if (userRole === 'CLIENTE') {
      // Los clientes solo ven servicios activos
      return this.prisma.servicio.findMany({
        where: { 
          activo: true 
        },
        include: {
          usuario: {
            select: {
              nombreCompleto: true
            }
          }
        },
        orderBy: { creadoEn: 'desc' },
      });
    } else {
      // Barberos ven sus propios servicios, ADMIN ve todos
      const whereCondition = userRole === 'ADMIN' ? {} : { userId };
      
      return this.prisma.servicio.findMany({
        where: whereCondition,
        include: {
          usuario: {
            select: {
              nombreCompleto: true,
              email: true
            }
          }
        },
        orderBy: { creadoEn: 'desc' },
      });
    }
  }

  async findOne(id: string, userId: string) {
    const servicio = await this.prisma.servicio.findFirst({
      where: { id },
      include: {
        usuario: {
          select: {
            nombreCompleto: true,
            email: true
          }
        }
      }
    });
    
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    
    return servicio;
  }

  async update(id: string, updateServicioDto: UpdateServicioDto, userId: string, userRole?: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id }
    });
    
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    
    // Solo el dueño del servicio o un ADMIN puede actualizarlo
    if (servicio.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para actualizar este servicio');
    }
    
    return this.prisma.servicio.update({
      where: { id },
      data: updateServicioDto,
      include: {
        usuario: {
          select: {
            nombreCompleto: true,
            email: true
          }
        }
      }
    });
  }

  async remove(id: string, userId: string, userRole?: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id }
    });
    
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    
    // Solo el dueño del servicio o un ADMIN puede eliminarlo
    if (servicio.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para eliminar este servicio');
    }
    
    return this.prisma.servicio.delete({
      where: { id },
    });
  }
}
