import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateBarberoDto {
  @ApiProperty({ description: 'Nombre del barbero' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Especialidad del barbero' })
  @IsString()
  especialidad: string;

  @ApiProperty({ description: 'ID del usuario asociado al barbero' })
  @IsString()
  usuarioId: string;

  @ApiProperty({ description: 'Años de experiencia', required: false })
  @IsOptional()
  @IsInt()
  anosExperiencia?: number;

  @ApiProperty({ description: 'Biografía del barbero', required: false })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiProperty({ description: 'URL de la imagen de perfil', required: false })
  @IsOptional()
  @IsString()
  imagenPerfil?: string;

  @ApiProperty({ description: 'Indica si el barbero está disponible', default: true })
  @IsOptional()
  @IsBoolean()
  disponible?: boolean = true;
}