import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('estadisticas')
@UseGuards(AuthGuard('jwt'))
export class EstadisticasController {
  constructor(
    private readonly estadisticasService: EstadisticasService, // Inyecta el servicio de estadísticas
  ) {}

  // Solo admins
  private isAdmin(req): boolean {
    return req.user && req.user.perfil === 'administrador';
  }

  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Req() req,
  ) {
    if (!this.isAdmin(req)) return { error: 'No autorizado' };
    return this.estadisticasService.getPublicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-totales')
  async comentariosTotales(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Req() req,
  ) {
    if (!this.isAdmin(req)) return { error: 'No autorizado' };
    return this.estadisticasService.comentariosTotales(
      new Date(desde),
      new Date(hasta),
    );
  }

  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Req() req,
  ) {
    if (!this.isAdmin(req)) return { error: 'No autorizado' };
    return this.estadisticasService.comentariosPorPublicacion(
      new Date(desde),
      new Date(hasta),
    );
  }

  @Get('comentarios-por-usuario')
  async comentariosPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Req() req,
  ) {
    if (!this.isAdmin(req)) return { error: 'No autorizado' };
    return this.estadisticasService.comentariosPorUsuario(
      new Date(desde),
      new Date(hasta),
    );
  }

  @Get('primer-fecha-publicacion')
  async getPrimerFechaPublicacion() {
    const pub =
      (await this.estadisticasService.getPrimerFechaPublicacion()) as {
        createdAt?: Date;
      };
    return { fecha: pub && pub.createdAt ? pub.createdAt : new Date() };
  }
}
