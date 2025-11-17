import { Controller } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Los endpoints de usuarios se manejan principalmente a través de AuthController
  // Este controller puede extenderse en el futuro si se necesitan más operaciones
}
