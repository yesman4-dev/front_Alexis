export class Ingreso {
     id?: number;
    descripcion: string = '';
    valorIngreso: number = 0;
    fechaRegistro: Date = new Date();
  
    constructor(init?: Partial<Ingreso>) {
      Object.assign(this, init);
    }
}
