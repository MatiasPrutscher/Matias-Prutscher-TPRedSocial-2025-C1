import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private jwtService: JwtService,
  ) {}

  private crearPayload(usuario: any) {
    return {
      sub: usuario._id?.toString() || usuario.id?.toString(),
      mail: usuario.mail,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
  }

  async register(
    createUsuarioDto: CreateUsuarioDto,
    imagen: Express.Multer.File,
  ) {
    // Validar unicidad
    const existeMail = await this.usuarioModel.findOne({
      mail: createUsuarioDto.mail,
    });
    if (existeMail) throw new ConflictException('El mail ya está registrado');
    const existeUsuario = await this.usuarioModel.findOne({
      nombreUsuario: createUsuarioDto.nombreUsuario,
    });
    if (existeUsuario)
      throw new ConflictException('El nombre de usuario ya está registrado');

    // Guardar imagen
    let imagenUrl = '';
    if (imagen) {
      const nombreArchivo = uuidv4() + path.extname(imagen.originalname);
      const uploadsPath = process.env.UPLOADS_PATH || 'uploads';
      const ruta = path.join(process.cwd(), uploadsPath, nombreArchivo);
      fs.writeFileSync(ruta, imagen.buffer);
      imagenUrl = `/${uploadsPath}/${nombreArchivo}`;
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(createUsuarioDto.password, 10);

    // Crear usuario
    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      password: hash,
      imagen: imagenUrl,
      perfil: createUsuarioDto.perfil || 'usuario',
      activo: true,
    });
    await usuario.save();

    // No devolver la contraseña
    const { password, ...resto } = usuario.toObject();
    return resto;
  }

  async login(mailOrUser: string, password: string) {
    // Buscar por mail o nombreUsuario
    const usuario = await this.usuarioModel.findOne({
      $or: [{ mail: mailOrUser }, { nombreUsuario: mailOrUser }],
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException(
        'Usuario deshabilitado. Contacte al administrador.',
      );
    }

    // Comparar contraseñas
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Generar token
    const payload = this.crearPayload(usuario);
    const token = this.jwtService.sign(payload);

    // No devolver la contraseña
    const { password: _, ...usuarioSinPassword } = usuario.toObject();
    return { token, usuario: usuarioSinPassword };
  }

  // Autorizar usuario con token
  generarToken(user) {
    const payload = this.crearPayload(user);
    return this.jwtService.sign(payload);
  }
}
