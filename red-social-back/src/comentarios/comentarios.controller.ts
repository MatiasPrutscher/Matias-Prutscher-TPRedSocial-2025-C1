import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // Traer comentarios de una publicación, paginados y ordenados
  @Get(':publicacionId')
  async getComentarios(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset = 0,
    @Query('limit') limit = 5,
  ) {
    return this.comentariosService.getComentarios(
      publicacionId,
      Number(offset),
      Number(limit),
    );
  }

  // Contar comentarios de una publicación
  @Get(':publicacionId/count')
  async contarComentarios(@Param('publicacionId') publicacionId: string) {
    const total =
      await this.comentariosService.contarComentarios(publicacionId);
    return { total };
  }

  // Agregar un comentario a una publicación
  @UseGuards(AuthGuard('jwt'))
  @Post(':publicacionId')
  async addComentario(
    @Param('publicacionId') publicacionId: string,
    @Body('texto') texto: string,
    @Req() req: any,
  ) {
    return this.comentariosService.addComentario(
      publicacionId,
      req.user['userId'],
      texto,
    );
  }

  // Modificar un comentario
  @UseGuards(AuthGuard('jwt'))
  @Put(':comentarioId')
  async updateComentario(
    @Param('comentarioId') comentarioId: string,
    @Body('texto') texto: string,
    @Req() req: any,
  ) {
    return this.comentariosService.updateComentario(
      comentarioId,
      texto,
      req.user['userId'],
      req.user['perfil'],
    );
  }

  // Eliminar un comentario (baja lógica)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':comentarioId')
  async eliminarComentario(
    @Param('comentarioId') comentarioId: string,
    @Req() req: any,
  ) {
    return this.comentariosService.bajaLogica(
      comentarioId,
      req.user['userId'],
      req.user['perfil'],
    );
  }
}
