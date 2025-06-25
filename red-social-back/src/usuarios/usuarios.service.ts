import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async getPerfil(userId: string) {
    const usuario = await this.usuarioModel.findById(userId).lean();
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return {
      nombre: usuario.nombre,
      descripcion: usuario.descripcion,
      mail: usuario.mail,
      fechaNacimiento: usuario.fechaNacimiento,
      avatarUrl: usuario.imagen,
    };
  }
}
