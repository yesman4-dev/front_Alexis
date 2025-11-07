import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Trueque } from '../Clases/trueque';

@Injectable({
  providedIn: 'root'
})
export class TruequeService {

  constructor(private http: HttpClient) { }

  // 🔹 Crear un nuevo trueque
  CrearTrueque(trueque: Trueque): Observable<BackendMessage> {
    const url = Url.url + '/api/Trueque/Crear';
    return this.http.post<BackendMessage>(url, trueque);
  }

  // 🔹 Obtener historial de trueques por cliente
  ObtenerHistorial(clienteId: number): Observable<any> {
    const url = Url.url + `/api/Trueque/Historial/${clienteId}`;
    return this.http.get<any>(url);
  }

  // 🔹 Agregar detalles a un trueque existente
  AgregarDetalles(truequeId: number, dto: any): Observable<BackendMessage> {
    const url = Url.url + `/api/Trueque/AgregarDetalles/${truequeId}`;
    return this.http.post<BackendMessage>(url, dto);
  }

  // 🟢 NUEVO 1️⃣ - Registrar pago del cliente (Ingreso)
  RegistrarPagoCliente(dto: any): Observable<BackendMessage> {
    const url = Url.url + '/api/Trueque/RegistrarPagoCliente';
    return this.http.post<BackendMessage>(url, dto);
  }

  // 🔴 NUEVO 2️⃣ - Registrar pago de la farmacia al cliente (Egreso)
  RegistrarPagoFarmacia(dto: any): Observable<BackendMessage> {
    const url = Url.url + '/api/Trueque/RegistrarPagoFarmacia';
    return this.http.post<BackendMessage>(url, dto);
  }
  
}
