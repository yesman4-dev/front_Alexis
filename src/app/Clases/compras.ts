import { DetalleCompra } from "./detalle-compra"
export class Compras {
    id?: number
    totalCompra: number
    usuarioId: number
    fechaRegistro?: Date
    proveedorId: number 
    tipoTransaccionId: number 
    detalleCompras: DetalleCompra[]

    usuarioNombre?: string
    proveedorNombre?: string
    tipoTransaccionNombre?: string


    constructor(){
        this.tipoTransaccionNombre = ""
        this.proveedorNombre = ""
        this.usuarioNombre = ""
        this.totalCompra = 0
        this.usuarioId = 0
        this.proveedorId = 0
        this.tipoTransaccionId = 0
        this.detalleCompras = []

    }
}
