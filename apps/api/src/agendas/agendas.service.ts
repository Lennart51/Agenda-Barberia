import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Injectable()
export class AgendasService {
  constructor(private prisma: PrismaService) {}

  async create(createAgendaDto: CreateAgendaDto) {
    return this.prisma.agenda.create({
      data: createAgendaDto,
    });
  }

  async findAll() {
    return this.prisma.agenda.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.agenda.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateAgendaDto: UpdateAgendaDto) {
    return this.prisma.agenda.update({
      where: { id },
      data: updateAgendaDto,
    });
  }

  async remove(id: string) {
    return this.prisma.agenda.delete({
      where: { id },
    });
  }
}
