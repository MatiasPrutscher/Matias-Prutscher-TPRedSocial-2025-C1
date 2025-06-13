import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { AuthService } from './auth.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen'))
  async register(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    // Conversión de fecha dd-mm-aaaa a aaaa-mm-dd
    if (
      createUsuarioDto.fechaNacimiento &&
      typeof createUsuarioDto.fechaNacimiento === 'string'
    ) {
      const partes = createUsuarioDto.fechaNacimiento.split('-');
      if (partes.length === 3) {
        // dd-mm-aaaa → aaaa-mm-dd (como string)
        createUsuarioDto.fechaNacimiento = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }
    }

    // Ahora sí, validación manual del DTO
    const dtoInstance = plainToInstance(CreateUsuarioDto, createUsuarioDto);
    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      const messages = errors
        .filter(err => err.constraints)
        .map(err => Object.values(err.constraints!))
        .flat();
      throw new BadRequestException(messages);
    }

    if (createUsuarioDto.password !== createUsuarioDto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    return this.authService.register(createUsuarioDto, imagen);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('mailOrUser') mailOrUser: string,
    @Body('password') password: string
  ) {
    return this.authService.login(mailOrUser, password);
  }
}
