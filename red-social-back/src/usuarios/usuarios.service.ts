import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

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

  async listarUsuarios(perfil: string) {
    if (perfil !== 'administrador')
      throw new ForbiddenException('No autorizado');
    return this.usuarioModel.find().lean();
  }

  async bajaLogica(id: string, perfil: string) {
    if (perfil !== 'administrador')
      throw new ForbiddenException('No autorizado');
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.activo = false;
    await usuario.save();
    return { message: 'Usuario deshabilitado' };
  }

  async altaLogica(id: string, perfil: string) {
    if (perfil !== 'administrador')
      throw new ForbiddenException('No autorizado');
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.activo = true;
    await usuario.save();
    return { message: 'Usuario habilitado' };
  }

  async crearUsuario(dto: any, perfil: string) {
    if (perfil !== 'administrador')
      throw new ForbiddenException('No autorizado');
    // Validar unicidad de mail y nombreUsuario
    const existeMail = await this.usuarioModel.findOne({ mail: dto.mail });
    if (existeMail) throw new ForbiddenException('El mail ya está registrado');
    const existeUsuario = await this.usuarioModel.findOne({
      nombreUsuario: dto.nombreUsuario,
    });
    if (existeUsuario)
      throw new ForbiddenException('El nombre de usuario ya está registrado');

    // Validar que las contraseñas coincidan
    if (dto.password !== dto.repetirPassword) {
      throw new ForbiddenException('Las contraseñas no coinciden');
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const usuario = new this.usuarioModel({
      ...dto,
      password: hash,
      perfil: dto.perfil || 'usuario',
      activo: true,
    });
    await usuario.save();

    // No devolver la contraseña
    const { password, ...resto } = usuario.toObject();
    return resto;
  }

  async editarUsuario(id: string, updateData: any, perfil: string) {
    if (perfil !== 'administrador')
      throw new ForbiddenException('No autorizado');

    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Actualizar solo los campos permitidos
    if (updateData.perfil) usuario.perfil = updateData.perfil;
    if (updateData.nombre) usuario.nombre = updateData.nombre;
    if (updateData.apellido) usuario.apellido = updateData.apellido;
    if (updateData.mail) usuario.mail = updateData.mail;
    if (updateData.nombreUsuario)
      usuario.nombreUsuario = updateData.nombreUsuario;

    await usuario.save();

    // No devolver la contraseña
    const { password, ...usuarioSinPassword } = usuario.toObject();
    return usuarioSinPassword;
  }
}
