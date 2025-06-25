import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import {
  Comentario,
  ComentarioDocument,
} from '../comentarios/schemas/comentario.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
  ) {}

  async crear(
    createDto: CreatePublicacionDto,
    usuarioId: string,
    imagenUrl?: string,
  ) {
    const nueva = new this.publicacionModel({
      ...createDto,
      usuario: usuarioId,
      imagen: imagenUrl,
    });
    return nueva.save();
  }

  async listar({ orden, usuario, offset, limit }) {
    const filtro: any = { activo: true };
    if (usuario) filtro.usuario = usuario;

    let query = this.publicacionModel
      .find(filtro)
      .skip(offset)
      .limit(limit)
      .populate('usuario', 'nombre imagen');

    if (orden === 'likes') {
      query = query.sort({ likes: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }
    const publicaciones = await query.exec();

    const publicacionesConComentarios = await Promise.all(
      publicaciones.map(async (pub) => {
        const comentarios = await this.comentarioModel.find({
          publicacion: pub._id,
          activo: true,
        });
        const comentariosCount = comentarios.length;
        return {
          ...pub.toObject(),
          comentariosCount,
        };
      }),
    );

    return publicacionesConComentarios;
  }

  async darLike(id: string, userId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    if (!pub.usuariosLike) pub.usuariosLike = [];
    if (pub.usuariosLike.some((u) => u.toString() === userId)) return pub;
    pub.usuariosLike.push(new Types.ObjectId(userId));
    pub.likes = pub.usuariosLike.length;
    await pub.save();
    return pub;
  }

  async quitarLike(id: string, userId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    pub.usuariosLike = (pub.usuariosLike || []).filter(
      (u) => u.toString() !== userId,
    );
    pub.likes = pub.usuariosLike.length;
    await pub.save();
    return pub;
  }

  async bajaLogica(id: string, userId: string, perfil: string) {
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');
    if (
      publicacion.usuario.toString() !== userId &&
      perfil !== 'administrador'
    ) {
      throw new ForbiddenException('No autorizado');
    }
    publicacion.activo = false;
    await publicacion.save();
    return { message: 'Publicación dada de baja' };
  }

  async getPorId(id: string) {
    const pub = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .populate('usuario', 'nombre nombreUsuario imagen')
      .exec();
    if (!pub) return null;

    // Contar comentarios activos de esta publicación
    const comentariosCount = await this.comentarioModel.countDocuments({
      publicacion: pub._id,
      activo: true,
    });

    return {
      ...pub.toObject(),
      comentariosCount,
    };
  }
}
