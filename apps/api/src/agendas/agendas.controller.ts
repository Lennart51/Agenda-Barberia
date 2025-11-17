import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AgendasService } from './agendas.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('agendas')
@Controller('agendas')
export class AgendasController {
  constructor(private readonly agendasService: AgendasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva agenda' })
  @ApiResponse({ status: 201, description: 'La agenda ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createAgendaDto: CreateAgendaDto) {
    return this.agendasService.create(createAgendaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las agendas' })
  @ApiResponse({ status: 200, description: 'Lista de agendas obtenida exitosamente.' })
  findAll() {
    return this.agendasService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  @ApiOperation({ summary: 'ADMIN: Obtener TODAS las agendas del sistema (requiere rol ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista completa de agendas (solo ADMIN)' })
  @ApiResponse({ status: 401, description: 'Token inválido o caducado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Se requiere rol ADMIN' })
  findAllAdmin() {
    return this.agendasService.findAll();
  }

  @Get('completed')
  @ApiOperation({ summary: 'Obtener todas las agendas completadas' })
  @ApiResponse({ status: 200, description: 'Lista de agendas completadas obtenida exitosamente.' })
  findCompleted() {
    return this.agendasService.findCompleted();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Obtener todas las agendas pendientes' })
  @ApiResponse({ status: 200, description: 'Lista de agendas pendientes obtenida exitosamente.' })
  findPending() {
    return this.agendasService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una agenda por ID' })
  @ApiParam({ name: 'id', description: 'ID de la agenda' })
  @ApiResponse({ status: 200, description: 'Agenda encontrada.' })
  @ApiResponse({ status: 404, description: 'Agenda no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.agendasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una agenda' })
  @ApiParam({ name: 'id', description: 'ID de la agenda' })
  @ApiResponse({ status: 200, description: 'Agenda actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Agenda no encontrada.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(@Param('id') id: string, @Body() updateAgendaDto: UpdateAgendaDto) {
    return this.agendasService.update(id, updateAgendaDto);
  }

  @Patch(':id/toggle-complete')
  @ApiOperation({ summary: 'Marcar/desmarcar agenda como completada' })
  @ApiParam({ name: 'id', description: 'ID de la agenda' })
  @ApiResponse({ status: 200, description: 'Estado de completado actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Agenda no encontrada.' })
  toggleComplete(@Param('id') id: string) {
    return this.agendasService.toggleComplete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una agenda' })
  @ApiParam({ name: 'id', description: 'ID de la agenda' })
  @ApiResponse({ status: 200, description: 'Agenda eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Agenda no encontrada.' })
  remove(@Param('id') id: string) {
    return this.agendasService.remove(id);
  }
}
