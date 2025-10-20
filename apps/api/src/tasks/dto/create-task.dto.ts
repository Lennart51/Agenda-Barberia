import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea' })
  title: string;

  @ApiProperty({ description: 'Descripción de la tarea', required: false })
  description?: string;

  @ApiProperty({ description: 'Estado de completado', required: false })
  completed?: boolean;
}
