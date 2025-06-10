import { Component, OnInit } from '@angular/core';
import { Publicacion } from '../../interfaces/red-social-model';
import { PublicacionService } from '../../services/publicacion/publicacion.service';

@Component({
  selector: 'app-publicaciones',
  imports: [],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css'],
})
export class PublicacionesComponent implements OnInit {
  publicaciones: Publicacion[] = [];

  constructor(private publicacionService: PublicacionService) {}

  ngOnInit() {
    this.publicacionService.getPublicaciones().subscribe((pubs) => {
      this.publicaciones = pubs;
    });
  }
}
