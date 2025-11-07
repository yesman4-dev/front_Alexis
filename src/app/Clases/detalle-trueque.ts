export class DetalleTrueque {
    id?: number
    productoId: number
    productoUnidadMedidaId : number
    loteProductoId?: number
    cantidad : number
    precioCostoUnitario : number
    esRecibido: boolean
    fecha?:  Date

      // 👉 Propiedades auxiliares para la vista
    productoNombre?: string;
    unidadMedidaNombre?: string;

    constructor(){
      this.productoId = 0
        this.productoUnidadMedidaId = 0
        this.loteProductoId = 0
        this.cantidad = 0
        this.precioCostoUnitario = 0
        this.esRecibido = true
    }
}
