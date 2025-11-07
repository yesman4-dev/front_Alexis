export class Notificacion {
    id?: number;
    usuarioId: number;  // Usuario que recibe la notificación
    tipo: string;  // Ejemplo: "Reaccion", "Comentario", "Pedido", "SolicitudAmistad"
    mensaje: string;
    fecha: Date;
    visto: boolean;
    vistoPorPanel: boolean
    entidadRelacionadaId?: number;  // ID del video, comentario, pedido, etc.
    entidadRelacionadaTipo?: string;  // Tipo de entidad ("Video", "Comentario", "Pedido", etc.)

    constructor(
        id: number,
        usuarioId: number,
        tipo: string,
        mensaje: string,
        fecha: Date,
        visto: boolean = false,
        vistoPorPanel: boolean = false,
        entidadRelacionadaId?: number,
        entidadRelacionadaTipo?: string
    ) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.visto = visto;
        this.vistoPorPanel = vistoPorPanel
        this.entidadRelacionadaId = entidadRelacionadaId;
        this.entidadRelacionadaTipo = entidadRelacionadaTipo;
    }
}

