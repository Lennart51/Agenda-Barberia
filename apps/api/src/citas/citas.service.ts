import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async create(createCitaDto: CreateCitaDto, userId: string) {
    try {
      // Verificar que el cliente existe
      const cliente = await this.prisma.cliente.findFirst({
        where: { usuarioId: userId }
      });

      if (!cliente) {
        throw new BadRequestException('Usuario no tiene perfil de cliente');
      }

      // Verificar que el barbero existe y está disponible
      const barbero = await this.prisma.barbero.findUnique({
        where: { id: createCitaDto.barberoId }
      });

      if (!barbero || !barbero.disponible) {
        throw new BadRequestException('Barbero no disponible');
      }

      // Verificar disponibilidad de horario (simplificado)
      const conflicto = await this.prisma.cita.findFirst({
        where: {
          barberoId: createCitaDto.barberoId,
          estado: { in: ['PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO'] },
          OR: [
            {
              AND: [
                { horaInicio: { lte: createCitaDto.horaInicio } },
                { horaFin: { gt: createCitaDto.horaInicio } }
              ]
            },
            {
              AND: [
                { horaInicio: { lt: createCitaDto.horaFin } },
                { horaFin: { gte: createCitaDto.horaFin } }
              ]
            }
          ]
        }
      });

      if (conflicto) {
        throw new BadRequestException('El horario seleccionado no está disponible');
      }

      // Calcular monto total basado en servicios
      const servicios = await this.prisma.servicio.findMany({
        where: { id: { in: createCitaDto.servicios } }
      });

      const montoTotal = servicios.reduce((total, servicio) => 
        total + Number(servicio.precioBase), 0
      );

      // Crear la cita
      const cita = await this.prisma.cita.create({
        data: {
          clienteId: cliente.id,
          barberoId: createCitaDto.barberoId,
          horaInicio: createCitaDto.horaInicio,
          horaFin: createCitaDto.horaFin,
          notasCliente: createCitaDto.notasCliente,
          montoTotal,
          estado: 'PENDIENTE',
        },
        include: {
          cliente: {
            include: { usuario: true }
          },
          barbero: true,
          servicios: {
            include: { servicio: true }
          }
        }
      });

      // Crear relaciones con servicios
      for (const servicioId of createCitaDto.servicios) {
        const servicio = servicios.find(s => s.id === servicioId);
        if (servicio) {
          await this.prisma.citaServicio.create({
            data: {
              citaId: cita.id,
              servicioId: servicio.id,
              precio: Number(servicio.precioBase),
              duracionMinutos: servicio.duracionMinutos,
            }
          });
        }
      }

      return this.findOne(cita.id, userId, 'CLIENTE');
    } catch (error) {
      throw new BadRequestException('Error al crear la cita: ' + error.message);
    }
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return this.prisma.cita.findMany({
      skip,
      take: limit,
      orderBy: { horaInicio: 'desc' },
      include: {
        cliente: {
          include: { usuario: true }
        },
        barbero: true,
        servicios: {
          include: { servicio: true }
        }
      }
    });
  }

  async findByCliente(clienteId: string, userId: string, userRole: string) {
    // Verificar permisos
    if (userRole !== 'ADMIN') {
      const cliente = await this.prisma.cliente.findFirst({
        where: { 
          id: clienteId,
          usuarioId: userId 
        }
      });

      if (!cliente) {
        throw new ForbiddenException('No tienes permisos para ver estas citas');
      }
    }

    return this.prisma.cita.findMany({
      where: { clienteId },
      orderBy: { horaInicio: 'desc' },
      include: {
        cliente: {
          include: { usuario: true }
        },
        barbero: true,
        servicios: {
          include: { servicio: true }
        }
      }
    });
  }

  async findByBarbero(barberoId: string, userId: string, userRole: string) {
    // Verificar permisos
    if (userRole !== 'ADMIN') {
      const barbero = await this.prisma.barbero.findFirst({
        where: { 
          id: barberoId,
          usuarioId: userId 
        }
      });

      if (!barbero) {
        throw new ForbiddenException('No tienes permisos para ver estas citas');
      }
    }

    return this.prisma.cita.findMany({
      where: { barberoId },
      orderBy: { horaInicio: 'desc' },
      include: {
        cliente: {
          include: { usuario: true }
        },
        barbero: true,
        servicios: {
          include: { servicio: true }
        }
      }
    });
  }

  async getHorariosOcupados(barberoId: string, fecha: string) {
    const fechaConsulta = new Date(fecha);
    const inicioDelDia = new Date(fechaConsulta);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fechaConsulta);
    finDelDia.setHours(23, 59, 59, 999);

    console.log('Buscando horarios ocupados para:', {
      barberoId,
      fecha,
      inicioDelDia,
      finDelDia
    });

    const citasOcupadas = await this.prisma.cita.findMany({
      where: {
        barberoId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO'] },
        horaInicio: {
          gte: inicioDelDia,
          lte: finDelDia,
        },
      },
      select: {
        horaInicio: true,
        horaFin: true,
      },
    });

    console.log('Citas encontradas:', citasOcupadas);

    return citasOcupadas.map(cita => ({
      inicio: cita.horaInicio,
      fin: cita.horaFin,
    }));
  }

  async findOne(id: string, userId: string, userRole: string) {
    const cita = await this.prisma.cita.findUnique({
      where: { id },
      include: {
        cliente: {
          include: { usuario: true }
        },
        barbero: true,
        servicios: {
          include: { servicio: true }
        }
      }
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    // Verificar permisos
    if (userRole !== 'ADMIN') {
      const esCliente = cita.cliente.usuarioId === userId;
      const esBarbero = cita.barbero.usuarioId === userId;
      
      if (!esCliente && !esBarbero) {
        throw new ForbiddenException('No tienes permisos para ver esta cita');
      }
    }

    return cita;
  }

  async update(id: string, updateCitaDto: UpdateCitaDto, userId: string, userRole: string) {
    // Verificar que la cita existe y permisos
    const cita = await this.findOne(id, userId, userRole);

    try {
      return await this.prisma.cita.update({
        where: { id },
        data: updateCitaDto,
        include: {
          cliente: {
            include: { usuario: true }
          },
          barbero: true,
          servicios: {
            include: { servicio: true }
          }
        }
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar la cita: ' + error.message);
    }
  }

  async remove(id: string, userId: string, userRole: string) {
    // Verificar que la cita existe y permisos
    await this.findOne(id, userId, userRole);

    try {
      await this.prisma.cita.delete({
        where: { id }
      });
      
      return { message: 'Cita eliminada exitosamente' };
    } catch (error) {
      throw new BadRequestException('Error al eliminar la cita: ' + error.message);
    }
  }
}