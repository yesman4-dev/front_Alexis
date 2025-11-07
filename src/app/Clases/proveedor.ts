export class Proveedor {
    id?: number;
    telefono?: string;
    nombreProveedor: string;
    esActivo: Boolean
    direccion?: string

    constructor(){
        this.id = 0
        this.telefono = ""
        this.nombreProveedor = ""
        this.esActivo = true
        this.direccion = ""
    }
}
