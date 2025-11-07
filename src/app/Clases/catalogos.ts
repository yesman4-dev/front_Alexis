export class Catalogos {
    id?: number;
    descripcion: string;
    esActivo: Boolean
    direccion?: string

    constructor(){
        this.id = 0
        this.descripcion = ""
        this.esActivo = true
        this.direccion = ""
    }
}
