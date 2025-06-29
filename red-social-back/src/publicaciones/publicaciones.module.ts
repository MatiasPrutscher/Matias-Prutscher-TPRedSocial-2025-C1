import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import {
  Comentario,
  ComentarioSchema,
} from '../comentarios/schemas/comentario.schema';
import { EstadisticasController } from './estadisticas/estadisticas.controller';
import { EstadisticasService } from './estadisticas/estadisticas.service';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}
