import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBarberoDto } from './dto/create-barbero.dto';
import { UpdateBarberoDto } from './dto/update-barbero.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BarberosService {
  constructor(private prisma: PrismaService) {}

  async create(createBarberoDto: CreateBarberoDto) {
    let usuarioId = createBarberoDto.usuarioId;

    // Si se proporcionan datos de usuario, crear usuario automáticamente
    if (!usuarioId && createBarberoDto.email && createBarberoDto.password) {
      // Verificar que el email no existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: createBarberoDto.email }
      });

      if (existingUser) {
        throw new BadRequestException('El email ya está en uso');
      }

      // Crear usuario
      const hashedPassword = await bcrypt.hash(createBarberoDto.password, 10);
      const newUser = await this.prisma.usuario.create({
        data: {
          email: createBarberoDto.email,
          contrasena: hashedPassword,
          nombreCompleto: createBarberoDto.nombreCompleto || createBarberoDto.nombre,
          telefono: createBarberoDto.telefono,
          rol: 'BARBERO',
        }
      });

      usuarioId = newUser.id;
    }

    if (!usuarioId) {
      throw new BadRequestException('Debe proporcionar usuarioId o datos de usuario (email y password)');
    }

    // Crear barbero - excluir campos de usuario del payload
    const { email, password, nombreCompleto, telefono, ...barberoData } = createBarberoDto;
    
    return this.prisma.barbero.create({
      data: {
        ...barberoData,
        usuarioId,
      },
      include: {
        usuario: true
      }
    });
  }

  findAll() {
    return this.prisma.barbero.findMany({
      where: {
        disponible: true
      },
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

  async findAvailableByDate(fecha: string) {
    const fechaConsulta = new Date(fecha);
    
    // Verificar que la fecha sea válida
    if (isNaN(fechaConsulta.getTime())) {
      throw new Error('Fecha inválida');
    }

    // Crear fechas para el inicio y fin del día
    const inicioDelDia = new Date(fechaConsulta);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fechaConsulta);
    finDelDia.setHours(23, 59, 59, 999);

    // Obtener barberos disponibles
    return this.prisma.barbero.findMany({
      where: {
        disponible: true
      },
      include: {
        usuario: true,
        servicios: {
          include: {
            servicio: true
          }
        },
        // Incluir citas del día para verificar disponibilidad
        citas: {
          where: {
            horaInicio: {
              gte: inicioDelDia,
              lt: finDelDia
            }
          },
          include: {
            servicios: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    });
  }

  findByUserId(userId: string) {
    return this.prisma.barbero.findFirst({
      where: { usuarioId: userId },
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