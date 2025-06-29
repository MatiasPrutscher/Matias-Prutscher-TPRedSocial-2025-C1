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
      usuario: new Types.ObjectId(usuarioId),
      imagen: imagenUrl,
    });
    return nueva.save();
  }

  async listar({ orden, usuario, offset, limit }) {
    const filtro: any = { activo: true };
    if (usuario) filtro.usuario = new Types.ObjectId(usuario);

    let query = this.publicacionModel
      .find(filtro)
      .skip(offset)
      .limit(limit)
      .populate('usuario', 'nombre imagen activo');
    if (orden === 'likes') {
      query = query.sort({ likes: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }
    const publicaciones = await query.exec();

    // Filtrar publicaciones cuyo usuario esté deshabilitado
    const publicacionesFiltradas = publicaciones.filter(
      (pub) =>
        pub.usuario &&
        typeof pub.usuario === 'object' &&
        'activo' in pub.usuario &&
        pub.usuario.activo,
    );

    // Agregar comentariosCount y el último comentario (con usuario) a cada publicación
    const publicacionesConComentarios = await Promise.all(
      publicacionesFiltradas.map(async (pub) => {
        const comentariosCount = await this.comentarioModel.countDocuments({
          publicacion: pub._id,
          activo: true,
        });

        // Traer el último comentario activo (más reciente)
        const ultimoComentario = await this.comentarioModel
          .findOne({ publicacion: pub._id, activo: true })
          .sort({ createdAt: -1 })
          .populate('usuario', 'nombreUsuario imagen')
          .lean();

        return {
          ...pub.toObject(),
          comentariosCount,
          comentarios: ultimoComentario ? [ultimoComentario] : [],
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

  async editarPublicacion(
    id: string,
    data: { titulo?: string; mensaje?: string; imagen?: string },
    userId: string,
    perfil: string,
  ) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    if (pub.usuario.toString() !== userId && perfil !== 'administrador') {
      throw new ForbiddenException('No autorizado');
    }
    if (data.titulo) pub.titulo = data.titulo;
    if (data.mensaje) pub.mensaje = data.mensaje;
    if (data.imagen !== undefined) pub.imagen = data.imagen;
    await pub.save();
    return pub;
  }
}
