import { Controller, Post, Body, Get, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser } from './user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente con access_token y refresh_token' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  signup(@Body() dto: SignUpDto) {
    return this.auth.signup(dto.email, dto.password, dto.nombreCompleto, dto.telefono, dto.rol);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso con access_token y refresh_token' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Información del usuario' })
  @ApiResponse({ status: 401, description: 'Token inválido o caducado' })
  me(@CurrentUser() user: any) {
    return this.auth.me(user.sub);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Nuevos tokens generados' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o caducado' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión (revoca tokens)' })
  @ApiBody({ type: LogoutDto })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  logout(
    @Headers('authorization') authHeader: string,
    @Body() dto: LogoutDto
  ) {
    const accessToken = authHeader?.replace('Bearer ', '');
    return this.auth.logout(accessToken, dto.refresh_token);
  }
}
