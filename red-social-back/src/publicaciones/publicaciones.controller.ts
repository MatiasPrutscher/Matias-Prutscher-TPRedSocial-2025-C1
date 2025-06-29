import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  Param,
  Delete,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('imagen'))
  async crear(
    @Body() createDto: CreatePublicacionDto,
    @UploadedFile() imagen: Express.Multer.File,
    @Req() req: any,
  ) {
    const usuarioId = req.user.userId;
    let imagenUrl = '';
    if (imagen) {
      imagenUrl = '/uploads/' + imagen.originalname;
    }
    return this.publicacionesService.crear(createDto, usuarioId, imagenUrl);
  }

  @Get()
  async listarPublicaciones(
    @Query('orden') orden: 'fecha' | 'likes' = 'fecha',
    @Query('usuario') usuario?: string,
    @Query('offset') offset = 0,
    @Query('limit') limit = 10,
  ) {
    return this.publicacionesService.listar({
      orden,
      usuario,
      offset: Number(offset),
      limit: Number(limit),
    });
  }

  // Dar like
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async darLike(@Param('id') id: string, @Req() req) {
    return this.publicacionesService.darLike(id, req.user.userId);
  }

  // Quitar like
  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async quitarLike(@Param('id') id: string, @Req() req) {
    return this.publicacionesService.quitarLike(id, req.user.userId);
  }

  // Eliminar publicación
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async eliminarPublicacion(@Param('id') id: string, @Req() req) {
    console.log('ELIMINAR req.user:', req.user);
    return this.publicacionesService.bajaLogica(
      id,
      req.user.userId,
      req.user.perfil,
    );
  }

  @Get(':id')
  async getPublicacion(@Param('id') id: string) {
    const pub = await this.publicacionesService.getPorId(id);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    return pub;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async editarPublicacion(
    @Param('id') id: string,
    @Body() body: { titulo?: string; mensaje?: string; imagen?: string },
    @Req() req: any,
  ) {
    return this.publicacionesService.editarPublicacion(
      id,
      body,
      req.user.userId,
      req.user.perfil,
    );
  }
}
