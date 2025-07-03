import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Delete,
  Param,
  Body,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
  async getPerfil(@Req() req) {
    return this.usuariosService.getPerfil(req.user.userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listarUsuarios(@Req() req) {
    // Solo admin
    return this.usuariosService.listarUsuarios(req.user.perfil);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async bajaLogica(@Param('id') id: string, @Req() req) {
    // Solo admin
    return this.usuariosService.bajaLogica(id, req.user.perfil);
  }

  @Post(':id/alta')
  @UseGuards(AuthGuard('jwt'))
  async altaLogica(@Param('id') id: string, @Req() req) {
    // Solo admin
    return this.usuariosService.altaLogica(id, req.user.perfil);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async crearUsuario(@Body() dto, @Req() req) {
    // Solo admin
    return this.usuariosService.crearUsuario(dto, req.user.perfil);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async editarUsuario(
    @Param('id') id: string,
    @Body() updateData: any,
    @Req() req,
  ) {
    return this.usuariosService.editarUsuario(id, updateData, req.user.perfil);
  }
}
