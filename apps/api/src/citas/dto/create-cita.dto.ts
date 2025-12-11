import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCitaDto {
  @ApiProperty({ 
    description: 'ID del barbero',
    example: 'barbero-uuid-123'
  })
  @IsString()
  @IsNotEmpty()
  barberoId: string;

  @ApiProperty({ 
    description: 'Fecha y hora de inicio de la cita',
    example: '2024-12-15T14:00:00.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  horaInicio: Date;

  @ApiProperty({ 
    description: 'Fecha y hora de fin de la cita',
    example: '2024-12-15T15:00:00.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  horaFin: Date;

  @ApiProperty({ 
    description: 'Array de IDs de servicios solicitados',
    example: ['servicio-uuid-1', 'servicio-uuid-2']
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  servicios: string[];

  @ApiProperty({ 
    description: 'Notas del cliente (opcional)',
    required: false,
    example: 'Prefiero corte no muy corto'
  })
  @IsOptional()
  @IsString()
  notasCliente?: string;
}