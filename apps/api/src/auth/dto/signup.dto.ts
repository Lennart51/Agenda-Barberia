import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @ApiProperty({ example: '+56912345678', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ 
    example: 'CLIENTE', 
    enum: ['ADMIN', 'BARBERO', 'CLIENTE'],
    required: false,
    description: 'Rol del usuario (por defecto CLIENTE)'
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'BARBERO', 'CLIENTE'])
  rol?: string;
}
