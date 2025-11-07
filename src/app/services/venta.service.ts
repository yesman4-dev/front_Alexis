import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Venta } from '../Clases/venta';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private http: HttpClient) { }


      // Agrega un nuevo detalle de venta a una venta existente
    AgregarDetalle(detalle: any): Observable<BackendMessage> {
      const url = `${Url.url}/api/Venta/agregar-detalle`;
      return this.http.post<any>(url, detalle);
    }

        // Elimina un detalle de venta
    EliminarDetalle(detalleVentaId: number): Observable<BackendMessage> {
      const url = `${Url.url}/api/Venta/eliminar-detalle/${detalleVentaId}`;
      return this.http.delete<any>(url);
    }

    // Edita un detalle de venta (cantidad y precio, según lo acordado)
    EditarDetalle(detalleVentaId: number, detalle: any): Observable<BackendMessage> {
      const url = `${Url.url}/api/Venta/editar-detalle/${detalleVentaId}`;
      return this.http.put<any>(url, detalle);
    }


    //metodo para crear una venta 
    Crear(venta: Venta): Observable<BackendMessage> {
      const url = Url.url + '/api/Venta/Crear';
      return this.http.post<BackendMessage>(url, venta);
    }

    // método para obtener una venta por ID
  ObtenerPorId(id: number): Observable<Venta> {
    const url = `${Url.url}/api/Venta/${id}`;
    return this.http.get<Venta>(url);
  }

    // Historial de precios por cliente y producto lo usare para saber a que precio se le ha dado 
  ObtenerHistorialPreciosClienteProducto(clienteId: number, productoId: number): Observable<any[]> {
    const url = `${Url.url}/api/Venta/HistorialPreciosClienteProducto?clienteId=${clienteId}&productoId=${productoId}`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener historial de precios', error);
        return throwError(() => error);
      })
    );
  }


    // método para buscar facturas donde se vendió un producto
  BuscarVentasPorProducto(productoId: number): Observable<Venta[]> {
    const url = `${Url.url}/api/Venta/BuscarVentasPorProducto?productoId=${productoId}`;
    return this.http.get<Venta[]>(url).pipe(
      catchError((error) => {
        console.error('Error al buscar ventas por producto', error);
        return throwError(() => error);
      })
    );
  }





  BuscarVentas(ventaId?: number, totalVenta?: number, clienteNombre?: string): Observable<Venta[]> {
    const url = Url.url + '/api/Venta/BuscarVentas';
    const params: any = {};
    if (ventaId !== undefined) params.ventaId = ventaId;
    if (totalVenta !== undefined) params.totalVenta = totalVenta;
    if (clienteNombre) params.clienteNombre = clienteNombre;

    return this.http.get<Venta[]>(url, { params }).pipe(
      catchError(error => {
        console.error('Error al buscar ventas:', error);
        return throwError(() => error);
      })
    );
  }



  // método para eliminar una venta por ID
  Eliminar(ventaId: number): Observable<BackendMessage> {
      const url = `${Url.url}/api/Venta/Eliminar/${ventaId}`;
      return this.http.delete<BackendMessage>(url);
  }

  ObtenerVentasPorUnidad(fechaInicio: Date, fechaFin: Date) {
    const url = `${Url.url}/api/Producto/VentasPorUnidad?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
      return this.http.get(url);
  }

  getListVentas(pagina: number, cantidadRegistros: number): Observable<{ items: Venta[], totalRegistros: number }> {
    const url = `${Url.url}/api/Venta/ListaVentas`;
    const params = {
      pagina: pagina.toString(),
      cantidadRegistros: cantidadRegistros.toString()
    };

    return this.http.get<{ items: Venta[], totalRegistros: number }>(url, { params });
  }


  getVentasPorFecha(fechaInicio: Date, fechaFin: Date): Observable<Venta[]> {
    const url = `${Url.url}/api/Venta/VentasPorFecha`;
    const params = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    };
    return this.http.get<Venta[]>(url, { params });
  }


   //para llenar el encabezado de credito de compras
    getListCreditoVentas(): Observable<Venta[]> {  
      const url = Url.url + '/api/CreditoVenta/ListaCreditoVenta';
      return this.http.get<Venta[]>(url);
    }

     //metodo para abonar o pagar saldo de un credito de venta
     PagarSaldoCreditoVentas(creditoVentaId: number, pago: any): Observable<BackendMessage> {
      const url = `${Url.url}/api/CreditoVenta/abonar/${creditoVentaId}`;
      return this.http.post<BackendMessage>(url, pago);
    }


    // Revertir venta de contado a crédito o de crédito a contado
    RevertirTipoVenta(ventaId: number): Observable<BackendMessage> {
      const url = `${Url.url}/api/Venta/RevertirTipoVenta/${ventaId}`;
      return this.http.put<BackendMessage>(url, null).pipe(
        catchError(err => {
          console.error('Error al revertir tipo de venta:', err);
          return throwError(() => err);
        })
      );
    }


    // Obtener los lotes disponibles por producto
    ObtenerLotesDisponiblesPorProducto(productoId: number, bodegaId: number = 1): Observable<any[]> {
      const url = `${Url.url}/api/Venta/LotesDisponiblesPorProducto/${productoId}?bodegaId=${bodegaId}`;
      return this.http.get<any[]>(url);
    }

}
