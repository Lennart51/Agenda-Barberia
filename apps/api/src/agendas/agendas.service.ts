import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Injectable()
export class AgendasService {
  constructor(private prisma: PrismaService) {}

  async create(createAgendaDto: CreateAgendaDto) {
    try {
      return await this.prisma.agenda.create({
        data: createAgendaDto,
      });
    } catch (error) {
      throw new BadRequestException('Error al crear la agenda: ' + error.message);
    }
  }

  async findAll() {
    try {
      return await this.prisma.agenda.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener las agendas: ' + error.message);
    }
  }

  async findOne(id: string) {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id },
    });

    if (!agenda) {
      throw new NotFoundException(`Agenda con ID ${id} no encontrada`);
    }

    return agenda;
  }

  async update(id: string, updateAgendaDto: UpdateAgendaDto) {
    // Verificar que la agenda existe
    await this.findOne(id);

    try {
      return await this.prisma.agenda.update({
        where: { id },
        data: updateAgendaDto,
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar la agenda: ' + error.message);
    }
  }

  async remove(id: string) {
    // Verificar que la agenda existe
    await this.findOne(id);

    try {
      return await this.prisma.agenda.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Error al eliminar la agenda: ' + error.message);
    }
  }

  // Método adicional para marcar como completada
  async toggleComplete(id: string) {
    const agenda = await this.findOne(id);
    
    return await this.prisma.agenda.update({
      where: { id },
      data: { completed: !agenda.completed },
    });
  }

  // Método adicional para obtener agendas completadas
  async findCompleted() {
    return await this.prisma.agenda.findMany({
      where: { completed: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Método adicional para obtener agendas pendientes
  async findPending() {
    return await this.prisma.agenda.findMany({
      where: { completed: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}
