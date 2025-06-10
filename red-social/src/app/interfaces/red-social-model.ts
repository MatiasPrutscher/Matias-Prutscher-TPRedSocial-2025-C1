export interface Comentario {
  usuario: string;
  texto: string;
}

export interface Publicacion {
  titulo: string;
  mensaje: string;
  imagen?: string;
  fecha: string;
  likes?: number;
  comentarios?: Comentario[];
}

export interface UsuarioPerfil {
  nombre: string;
  verificado: boolean;
  avatarUrl: string;
  seguidores: number;
  siguiendo: number;
  descripcion: string;
  email: string;
  fechaNacimiento: string;
  publicaciones: Publicacion[];
}
