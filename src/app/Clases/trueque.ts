import { DetalleTrueque } from "./detalle-trueque"
export class Trueque {
        id?: number 
        usuarioId: number
        clienteId: number
        detalles: DetalleTrueque[]
    
        totalGanancia?: number
        clienteNombre?: string
        fechaRegistro?: Date
        usuarioNombre?: string
    
        constructor(){
            this.usuarioId = 0
            this.clienteId = 0
            this.detalles = []
    
        }
}
