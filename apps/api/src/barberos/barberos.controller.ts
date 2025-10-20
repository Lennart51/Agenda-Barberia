import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BarberosService } from './barberos.service';
import { CreateBarberoDto } from './dto/create-barbero.dto';
import { UpdateBarberoDto } from './dto/update-barbero.dto';

@ApiTags('barberos')
@Controller('barberos')
export class BarberosController {
  constructor(private readonly barberosService: BarberosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo barbero' })
  @ApiResponse({ status: 201, description: 'El barbero ha sido creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createBarberoDto: CreateBarberoDto) {
    return this.barberosService.create(createBarberoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los barberos' })
  @ApiResponse({ status: 200, description: 'Lista de barberos obtenida exitosamente.' })
  findAll() {
    return this.barberosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un barbero por ID' })
  @ApiResponse({ status: 200, description: 'Barbero encontrado.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.barberosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un barbero' })
  @ApiResponse({ status: 200, description: 'Barbero actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(@Param('id') id: string, @Body() updateBarberoDto: UpdateBarberoDto) {
    return this.barberosService.update(id, updateBarberoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un barbero' })
  @ApiResponse({ status: 200, description: 'Barbero eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  remove(@Param('id') id: string) {
    return this.barberosService.remove(id);
  }
}