import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/user.decorator';

@ApiTags('citas')
@Controller('citas')
@ApiBearerAuth()
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva cita' })
  @ApiResponse({ status: 201, description: 'La cita ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createCitaDto: CreateCitaDto, @CurrentUser() user: any) {
    return this.citasService.create(createCitaDto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todas las citas (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de citas obtenida exitosamente.' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.citasService.findAll(page, limit);
  }

  @Get('cliente/:clienteId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener citas de un cliente específico' })
  @ApiResponse({ status: 200, description: 'Lista de citas del cliente.' })
  findByCliente(@Param('clienteId') clienteId: string, @CurrentUser() user: any) {
    // Solo el mismo cliente o un admin puede ver las citas
    return this.citasService.findByCliente(clienteId, user.sub, user.rol);
  }

  @Get('barbero/:barberoId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener citas de un barbero específico' })
  @ApiResponse({ status: 200, description: 'Lista de citas del barbero.' })
  findByBarbero(@Param('barberoId') barberoId: string, @CurrentUser() user: any) {
    return this.citasService.findByBarbero(barberoId, user.sub, user.rol);
  }

  @Get('horarios-ocupados/:barberoId/:fecha')
  @ApiOperation({ summary: 'Obtener horarios ocupados de un barbero en una fecha específica' })
  @ApiResponse({ status: 200, description: 'Lista de horarios ocupados.' })
  getHorariosOcupados(@Param('barberoId') barberoId: string, @Param('fecha') fecha: string) {
    return this.citasService.getHorariosOcupados(barberoId, fecha);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una cita por ID' })
  @ApiResponse({ status: 200, description: 'Cita encontrada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citasService.findOne(id, user.sub, user.rol);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar una cita' })
  @ApiResponse({ status: 200, description: 'Cita actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(
    @Param('id') id: string, 
    @Body() updateCitaDto: UpdateCitaDto,
    @CurrentUser() user: any
  ) {
    return this.citasService.update(id, updateCitaDto, user.sub, user.rol);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una cita' })
  @ApiResponse({ status: 200, description: 'Cita eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citasService.remove(id, user.sub, user.rol);
  }
}