export interface Message {
    id: number;
    remitenteId: number;
    estado: number;
    destinatarioId: number;
    texto?: string;
    tipoContenido: string;
    urlContenido: string | null;
    fecha: string;  // O puedes usar Date si prefieres trabajar con objetos Date
}
