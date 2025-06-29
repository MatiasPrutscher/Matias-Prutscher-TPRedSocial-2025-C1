export interface Comentario {
  usuario: any;
  texto: string;
  _id?: string;
  modificado?: boolean;
  createdAt?: string;
  editando?: boolean;
  textoEdit?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  usuario: any;
  likes: number;
  usuariosLike: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  comentariosCount?: number;
  comentarios?: Comentario[];
  __v?: number;
}

export interface UsuarioPerfil {
  nombre: string;
  verificado: boolean;
  avatarUrl: string;
  seguidores: number;
  siguiendo: number;
  descripcion: string;
  mail: string;
  fechaNacimiento: string;
}
