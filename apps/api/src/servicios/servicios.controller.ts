import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/user.decorator';

@ApiTags('servicios')
@ApiBearerAuth()
@Controller('servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @Roles('BARBERO', 'ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo servicio (Solo BARBERO o ADMIN)' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para crear servicios.' })
  create(@Body() createServicioDto: CreateServicioDto, @CurrentUser() user: any) {
    return this.serviciosService.create(createServicioDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los servicios disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de servicios obtenida exitosamente.' })
  findAll(@CurrentUser() user: any) {
    // Los clientes solo ven servicios activos, barberos/admin ven todos
    return this.serviciosService.findAll(user.sub, user.rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.serviciosService.findOne(id, user.sub);
  }

  @Patch(':id')
  @Roles('BARBERO', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar un servicio (Solo el BARBERO que lo creó o ADMIN)' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para actualizar este servicio.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto, @CurrentUser() user: any) {
    return this.serviciosService.update(id, updateServicioDto, user.sub, user.rol);
  }

  @Delete(':id')
  @Roles('BARBERO', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar un servicio (Solo el BARBERO que lo creó o ADMIN)' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar este servicio.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.serviciosService.remove(id, user.sub, user.rol);
  }
}
