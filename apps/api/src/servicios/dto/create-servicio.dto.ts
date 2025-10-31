import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export enum CategoriaServicio {
  CORTE = 'CORTE',
  BARBA = 'BARBA',
  AFEITADO = 'AFEITADO',
  TINTURA = 'TINTURA',
  TRATAMIENTO = 'TRATAMIENTO',
  COMBO = 'COMBO'
}

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(CategoriaServicio)
  @IsNotEmpty()
  categoria: CategoriaServicio;

  @IsNumber()
  @IsNotEmpty()
  precioBase: number;

  @IsNumber()
  @IsNotEmpty()
  duracionMinutos: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
