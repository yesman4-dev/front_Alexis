export class Cliente {
    id?: number;
    nombreCliente: string;
    rtn?: string ;
    direccion?: string;
    esActivo?: boolean;
    permiteCredito?: boolean;
    correo?: string;
    telefono?: string;
    fechaCreacionCliente?: Date;
    ciclos?: number;
  
    constructor() {
      this.id = 0;
      this.nombreCliente = '';
      this.rtn = '';
      this.direccion = '';
      this.esActivo = true;
      this.permiteCredito = true;
      this.correo = '';
      this.telefono = '';
      this.fechaCreacionCliente = new Date();
      this.ciclos = 0;
    }
  }
  