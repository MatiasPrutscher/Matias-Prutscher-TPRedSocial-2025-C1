import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Publicacion,
  PublicacionDocument,
} from '../schemas/publicacion.schema';
import {
  Comentario,
  ComentarioDocument,
} from '../../comentarios/schemas/comentario.schema';
import {
  Usuario,
  UsuarioDocument,
} from '../../usuarios/schemas/usuario.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Usuario.name)
    private usuarioModel: Model<UsuarioDocument>,
  ) {}

  // 1. Publicaciones por usuario en un rango de fechas
  async getPublicacionesPorUsuario(desde: string, hasta: string) {
    const desdeDate = new Date(desde);
    const hastaDate = new Date(hasta);

    return this.publicacionModel.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $group: {
          _id: '$usuario',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuarioInfo',
        },
      },
      { $unwind: '$usuarioInfo' },
      {
        $project: {
          usuario: '$usuarioInfo.nombreUsuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  // 2. Comentarios totales en un rango de fechas
  async comentariosTotales(desde: Date, hasta: Date) {
    const total = await this.comentarioModel.countDocuments({
      createdAt: { $gte: desde, $lte: hasta },
      activo: true,
    });
    return { total };
  }

  // 3. Comentarios por publicación en un rango de fechas
  async comentariosPorPublicacion(desde: Date, hasta: Date) {
    return this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta },
          activo: true,
        },
      },
      {
        $group: {
          _id: '$publicacion',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'publicacions',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$publicacion.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  async getPrimerFechaPublicacion() {
    return this.publicacionModel
      .findOne({})
      .sort({ createdAt: 1 })
      .select('createdAt')
      .lean()
      .exec();
  }
}
