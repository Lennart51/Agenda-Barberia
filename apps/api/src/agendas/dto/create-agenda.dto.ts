import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAgendaDto {
  @ApiProperty({ 
    description: 'Título de la agenda',
    example: 'Revisar inventario de productos'
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Descripción detallada de la agenda',
    required: false,
    example: 'Revisar el stock de productos de barbería y hacer pedido de los faltantes'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Indica si la agenda está completada',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
