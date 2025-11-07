export class Egreso {
    id?: number;
    descripcion: string = '';
    valorIngreso: number = 0;
    tipoEgresoId: number = 0;
    egresoNombre?: string;
    fechaRegistro: Date = new Date();
  
    constructor(init?: Partial<Egreso>) {
      Object.assign(this, init);
    }
  }
  
