import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// Servicio TasksService para gestionar tareas
// Utiliza PrismaService para interactuar con la base de datos
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Método para crear una nueva tarea
  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: createTaskDto,
    });
  }

  // Método para obtener todas las tareas con paginación
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.task.count()
    ]);

    return tasks;
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}