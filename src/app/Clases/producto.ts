import { OpcionesVenta } from "./opciones-venta"; // es lo mismo que producto unidad medida
export class Producto {
    id?: number;
    codigoProducto: string
    nombreProducto: string
    descripcionCorta?: string
    descripcionLarga?: string
    descuentoPorCantidad?: number
    stockActual?:number
    esFracionable : boolean
    opcionesVenta?: OpcionesVenta[]
    esActivo?: boolean
    esProductoEspecial?: boolean
    imagenURL?: string
    codigoBarras?: string
    categoriaProductoId: number
    laboratorioId: number
    presentacionContenidoId: number
    unidadMedidaId: number
    precioVenta: number
    precioCompra?: number

    laboratorioNombre?: string
    unidadMedidaNombre?: string
    presentacionContenidoNombre?: string

    constructor(){
        this.id = 0
        this.codigoProducto = ""
        this.nombreProducto = ""
        this.descripcionCorta = ""
        this.descripcionLarga = ""
        this.descuentoPorCantidad = 0
        this.esFracionable = false
        this.esProductoEspecial = false
        this.opcionesVenta = [] 
        this.imagenURL = ""
        this.codigoBarras = ""
        this.categoriaProductoId = 0
        this.laboratorioId = 0
        this.presentacionContenidoId = 0
        this.unidadMedidaId = 0
        this.precioVenta = 0
        this.stockActual = 0
        this.esActivo = true
        this.precioCompra = 0
    }
}
