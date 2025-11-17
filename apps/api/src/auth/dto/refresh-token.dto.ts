import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token obtenido en login o signup'
  })
  @IsString()
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  refresh_token!: string;
}
