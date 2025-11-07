export interface InventarioInicialProductoDTO {
  productoId: number;
  precioCompraUnitario: number;
  lotes: LoteInventarioInicialDTO[];
}

export interface LoteInventarioInicialDTO {
  fechaVencimiento: Date;
  stockActual: number;
  bodegaId: number;
}



