import { LoteProductos } from "./lote-productos"
export class DetalleCompra {
    productoId: number 
    precioCompraUnitario: number 
    cantidad: number
    productoNombre?: string
    loteProductos : LoteProductos[]


    constructor(){
        this.productoId = 0
        this.precioCompraUnitario = 0
        this.cantidad = 0
        this.loteProductos = []
    }

}
