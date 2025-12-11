import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateBarberoDto {
  @ApiProperty({ description: 'Nombre del barbero' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'ID del usuario asociado al barbero (opcional si se proporciona email)' })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  // Campos para crear usuario automáticamente
  @ApiProperty({ description: 'Email del barbero (para crear usuario automáticamente)', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Contraseña del barbero (para crear usuario automáticamente)', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Nombre completo del barbero (para crear usuario automáticamente)', required: false })
  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @ApiProperty({ description: 'Teléfono del barbero (para crear usuario automáticamente)', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

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