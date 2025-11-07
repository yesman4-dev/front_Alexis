export class DetalleVenta {
    id: number
    precioVentaUnitario: number
    cantidad: number
    productoId: number
    productoUnidadMedidaId: number
    loteProductoId?: number
    unidadDeMedidaNombre?: string

    constructor(){
        this.id = 0
        this.precioVentaUnitario = 0
        this.cantidad = 0
        this.productoId = 0
        this.productoUnidadMedidaId = 0
        this.loteProductoId = 0
    }
}
