import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/user.decorator';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me/cliente')
  @Roles('CLIENTE', 'ADMIN')
  @ApiOperation({ summary: 'Obtener información del cliente actual' })
  @ApiResponse({ status: 200, description: 'Información del cliente actual.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findMeCliente(@CurrentUser() user: any) {
    return this.usuariosService.findClienteByUserId(user.sub);
  }

  // Los endpoints de usuarios se manejan principalmente a través de AuthController
  // Este controller puede extenderse en el futuro si se necesitan más operaciones
}
