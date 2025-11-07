export class Usuarios {
  id?: number;
  telefono?: string;
  usuarioNombre: string;
  clave: string;
  correo?: string;
  rolUsuarioId: number;
  email?: string; 
  rol?: string
  esActivo: Boolean

  constructor(
  ) {
    this.id = 0;
    this.telefono = "";
    this.usuarioNombre = "";
    this.clave = "";
    this.rolUsuarioId = 0;
    this.email = "";
    this.correo = ""
    this.rol = ""
    this.esActivo = true
  }
}
