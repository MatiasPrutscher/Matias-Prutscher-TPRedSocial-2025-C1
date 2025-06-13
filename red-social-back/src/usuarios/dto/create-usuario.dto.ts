import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsEmail()
  mail: string;

  @IsNotEmpty()
  @IsString()
  nombreUsuario: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número.',
  })
  password: string;

  @IsNotEmpty()
  @MinLength(8)
  repetirPassword: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string | Date;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  perfil?: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}
