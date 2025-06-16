import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop()
  imagen?: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  usuariosLike: Types.ObjectId[];

  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
