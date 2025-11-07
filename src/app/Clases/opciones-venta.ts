export class OpcionesVenta {
    id?: number
    unidadMedidaId: number
    cantidadPorUnidad: number
    precioVenta: number
    productoUnidadMedidaId?: number

    constructor(){
     this.id = 0
     this.unidadMedidaId = 0
     this.cantidadPorUnidad = 0
     this.precioVenta = 0
     this.productoUnidadMedidaId = 0
    }
}
