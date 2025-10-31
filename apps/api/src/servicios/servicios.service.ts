import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicioDto: CreateServicioDto) {
    return this.prisma.servicio.create({
      data: createServicioDto,
    });
  }

  async findAll() {
    return this.prisma.servicio.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.servicio.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateServicioDto: UpdateServicioDto) {
    return this.prisma.servicio.update({
      where: { id },
      data: updateServicioDto,
    });
  }

  async remove(id: string) {
    return this.prisma.servicio.delete({
      where: { id },
    });
  }
}
