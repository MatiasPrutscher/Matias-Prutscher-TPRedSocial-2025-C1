import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePublicacionDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  mensaje: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}
