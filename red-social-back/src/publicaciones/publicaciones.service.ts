import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
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

    return await query.exec();
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
}
