import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  nombreCompleto: string;

  @ApiProperty({ example: 'juan@email.com', description: 'Correo electrónico del usuario' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
  contrasena: string;

  @ApiProperty({ example: 'CLIENTE', description: 'Rol del usuario (CLIENTE, BARBERO, ADMIN)', enum: ['CLIENTE', 'BARBERO', 'ADMIN'] })
  rol: 'CLIENTE' | 'BARBERO' | 'ADMIN';

  @ApiProperty({ example: '+1234567890', description: 'Número de teléfono del usuario', required: false })
  telefono?: string;
}