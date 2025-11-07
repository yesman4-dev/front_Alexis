import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Url } from '../modelos/url';
import { HttpHeaders } from '@angular/common/http';
import { BackendMessage } from '../modelos/backend-message';
import { an } from '@fullcalendar/core/internal-common';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private http: HttpClient) { }

    // Obtener conteo de productos por bodega
  ResumendeDatosGeneral(): Observable<any> {
    const url = `${Url.url}/api/Graficos/resumendatos`;
    return this.http.get<any>(url);
  }


  obtenerTicketCompraPDF(compraId: number): Observable<Blob> {
    const url = `${Url.url}/api/Reportes/ticket-compra/${compraId}`;
    const headers = new HttpHeaders({ 'Accept': 'application/pdf' });

    return this.http.get(url, { headers, responseType: 'blob' });
  }

  obtenerTicketVentaPDF(ventaId: number): Observable<Blob> {
    const url = `${Url.url}/api/Reportes/ticket-venta/${ventaId}`;
    const headers = new HttpHeaders({ 'Accept': 'application/pdf' });

    return this.http.get(url, { headers, responseType: 'blob' });
  }

    //grafico ingresos y egresoss
    obtenerResumenIngresosEgresos(fechaInicio?: string, fechaFin?: string): Observable<any> {
    const query = fechaInicio && fechaFin ? `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}` : '';
    return this.http.get<any>(`${Url.url}/api/Graficos/resumen-ingresos-egresos${query}`);
  }

  // Obtener conteo de productos por bodega
  obtenerConteoProductosPorBodega(): Observable<BackendMessage> {
    const url = `${Url.url}/api/Graficos/conteo-productos-por-bodega`;
    return this.http.get<BackendMessage>(url);
  }

    // cantidad de ventas por usuario
  obtenerCantidadeVentasPorUsuario(): Observable<any> {
    const url = `${Url.url}/api/Graficos/ventas-por-usuario`;
    return this.http.get<any>(url);
  }


}
