import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BarberosService } from './barberos.service';
import { CreateBarberoDto } from './dto/create-barbero.dto';
import { UpdateBarberoDto } from './dto/update-barbero.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/user.decorator';

@ApiTags('barberos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('barberos')
export class BarberosController {
  constructor(private readonly barberosService: BarberosService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo barbero (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'El barbero ha sido creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para realizar esta acción' })
  create(@Body() createBarberoDto: CreateBarberoDto) {
    return this.barberosService.create(createBarberoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los barberos disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de barberos obtenida exitosamente.' })
  findAll() {
    return this.barberosService.findAll();
  }

  @Get('me')
  @Roles('BARBERO', 'ADMIN')
  @ApiOperation({ summary: 'Obtener información del barbero actual' })
  @ApiResponse({ status: 200, description: 'Información del barbero actual.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  findMe(@CurrentUser() user: any) {
    return this.barberosService.findByUserId(user.sub);
  }

  @Get('disponibles/:fecha')
  @ApiOperation({ summary: 'Obtener barberos disponibles en una fecha específica' })
  @ApiResponse({ status: 200, description: 'Lista de barberos disponibles en la fecha especificada.' })
  @ApiResponse({ status: 400, description: 'Fecha inválida' })
  findAvailableByDate(@Param('fecha') fecha: string) {
    return this.barberosService.findAvailableByDate(fecha);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un barbero por ID' })
  @ApiResponse({ status: 200, description: 'Barbero encontrado.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.barberosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'BARBERO')
  @ApiOperation({ summary: 'Actualizar un barbero (Solo ADMIN o el mismo BARBERO)' })
  @ApiResponse({ status: 200, description: 'Barbero actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para realizar esta acción' })
  update(@Param('id') id: string, @Body() updateBarberoDto: UpdateBarberoDto) {
    return this.barberosService.update(id, updateBarberoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un barbero (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Barbero eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Barbero no encontrado.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para realizar esta acción' })
  remove(@Param('id') id: string) {
    return this.barberosService.remove(id);
  }
}