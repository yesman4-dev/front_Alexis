import { DetalleVenta } from "./detalle-venta"
export class Venta {
    id?: number 
    usuarioId: number
    clienteId: number
    totalVenta: number
    tipoTransaccionId: number
    detalleVentas: DetalleVenta[]

    totalGanancia?: number
    cobroPorEnvio?: number

    clienteNombre?: string
    fechaRegistro?: Date
    usuarioNombre?: string
    tipoTransaccionNombre?: string

    constructor(){
        this.usuarioId = 0
        this.clienteId = 0
        this.totalVenta = 0
        this.tipoTransaccionId = 0
        this.detalleVentas = []

    }
}
