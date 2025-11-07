export interface DecodedToken {
    exp: number;           // Expiración
    iat: number;           // Emitido en
    nbf: number;           // No válido antes de
    unique_name: string;   // UsuarioNombre
    nameid: number;        // ID del usuario
    role: number;          // Rol del usuario
  }
  