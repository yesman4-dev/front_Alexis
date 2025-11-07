import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';


@Injectable({
  providedIn: 'root'
})
export class AudotoriaService {

  constructor(private http: HttpClient) { }

  getListAudotoriaPorFechas(fechaInicio: Date, fechaFin: Date): Observable<any[]> {
    const url = `${Url.url}/api/Notificacion/ListaNotificaciones?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
    return this.http.get<any[]>(url);
  }

  getResumenCreditosPorCliente(): Observable<any[]> {
    const url = `${Url.url}/api/CreditoVenta/resumen-por-cliente`;
    return this.http.get<any[]>(url);
  }

  getCreditosPorCliente(clienteId: number): Observable<any[]> {
    const url = `${Url.url}/api/CreditoVenta/por-cliente/${clienteId}`;
    return this.http.get<any[]>(url);
  }

  getCreditosPorProveedor(proveedorId: number): Observable<any[]> {
    const url = `${Url.url}/api/CreditoCompra/por-proveedor/${proveedorId}`;
    return this.http.get<any[]>(url);
  }



}
