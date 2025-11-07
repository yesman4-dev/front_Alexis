import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VentaTempService {

  constructor() { }

  // Guardar formulario
  guardarFormulario(data: any): void {
    localStorage.setItem('ventaFormulario', JSON.stringify(data));
  }

  // Cargar formulario
  cargarFormulario(): any {
    const formulario = localStorage.getItem('ventaFormulario');
    return formulario ? JSON.parse(formulario) : null;
  }

  // Guardar detalles de la venta (productos)
  guardarDetalles(detalles: any): void {
    localStorage.setItem('ventaDetalles', JSON.stringify(detalles));
  }

  // Cargar detalles de la venta
  cargarDetalles(): any {
    const detalles = localStorage.getItem('ventaDetalles');
    return detalles ? JSON.parse(detalles) : [];
  }

  // Limpiar datos almacenados
  limpiarDatos(): void {
    localStorage.removeItem('ventaFormulario');
    localStorage.removeItem('ventaDetalles');
  }
}
