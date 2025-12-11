import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';

enum EstadoCita {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO',
}

export class UpdateCitaDto {
  @ApiProperty({ 
    description: 'Estado de la cita',
    enum: EstadoCita,
    required: false
  })
  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @ApiProperty({ 
    description: 'Notas internas (solo admin/barbero)',
    required: false
  })
  @IsOptional()
  @IsString()
  notasInternas?: string;

  @ApiProperty({ 
    description: 'Notas del cliente',
    required: false
  })
  @IsOptional()
  @IsString()
  notasCliente?: string;

  @ApiProperty({ 
    description: 'Fecha de cancelación',
    required: false
  })
  @IsOptional()
  @IsDateString()
  canceladaEn?: Date;

  @ApiProperty({ 
    description: 'Quién canceló la cita',
    required: false
  })
  @IsOptional()
  @IsString()
  canceladaPor?: string;

  @ApiProperty({ 
    description: 'Razón de cancelación',
    required: false
  })
  @IsOptional()
  @IsString()
  razonCancelacion?: string;
}