import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, nombreCompleto: string, telefono?: string, rol?: string) {
    const exists = await this.prisma.usuario.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email ya está en uso');
    
    const contrasena = await bcrypt.hash(password, 10);
    const userRole = rol as any || 'CLIENTE';
    
    const usuario = await this.prisma.usuario.create({ 
      data: { email, contrasena, nombreCompleto, telefono, rol: userRole } 
    });

    // Crear perfil específico según el rol
    if (userRole === 'CLIENTE') {
      await this.prisma.cliente.create({
        data: {
          usuarioId: usuario.id,
        }
      });
    }

    return usuario;
  }

  // Método para crear desde DTO
  async createFromDto(createUsuarioDto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: createUsuarioDto.email } });
    if (exists) throw new ConflictException('Email ya está en uso');
    
    //texto plano a hash
    if (createUsuarioDto.contrasena) {
      createUsuarioDto.contrasena = await bcrypt.hash(createUsuarioDto.contrasena, 10);
    }
    
    return this.prisma.usuario.create({ 
      data: createUsuarioDto as any
    });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  findClienteByUserId(userId: string) {
    return this.prisma.cliente.findFirst({
      where: { usuarioId: userId },
      include: {
        usuario: true
      }
    });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id }
    });
  }

  update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto
    });
  }

  remove(id: string) {
    return this.prisma.usuario.delete({
      where: { id }
    });
  }
}