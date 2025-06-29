import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
  ) {}

  // Traer comentarios paginados y ordenados (más recientes primero)
  async getComentarios(publicacionId: string, offset = 0, limit = 5) {
    return this.comentarioModel
      .find({ publicacion: new Types.ObjectId(publicacionId), activo: true })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('usuario', 'nombreUsuario imagen')
      .exec();
  }

  // Agregar comentario
  async addComentario(publicacionId: string, usuarioId: string, texto: string) {
    const nuevo = new this.comentarioModel({
      publicacion: new Types.ObjectId(publicacionId),
      usuario: new Types.ObjectId(usuarioId),
      texto,
    });
    return nuevo.save();
  }

  // Modificar comentario
  async updateComentario(
    comentarioId: string,
    texto: string,
    userId: string,
    perfil: string,
  ) {
    const comentario = await this.comentarioModel.findById(comentarioId);
    if (!comentario) throw new NotFoundException('Comentario no encontrado');
    if (
      comentario.usuario.toString() !== userId &&
      perfil !== 'administrador'
    ) {
      throw new ForbiddenException('No autorizado para editar este comentario');
    }
    comentario.texto = texto;
    comentario.modificado = true;
    await comentario.save();
    return comentario;
  }

  async bajaLogica(comentarioId: string, userId: string, perfil: string) {
    const comentario = await this.comentarioModel.findById(comentarioId);
    if (!comentario) throw new NotFoundException('Comentario no encontrado');
    if (
      comentario.usuario.toString() !== userId &&
      perfil !== 'administrador'
    ) {
      throw new ForbiddenException(
        'No autorizado para eliminar este comentario',
      );
    }
    comentario.activo = false;
    await comentario.save();
    return { message: 'Comentario eliminado' };
  }

  async contarComentarios(publicacionId: string) {
    return this.comentarioModel.countDocuments({
      publicacion: new Types.ObjectId(publicacionId),
      activo: true,
    });
  }
}
