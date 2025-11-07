import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Cliente } from '../Clases/cliente';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }

    //metodo para crear un cliente
    Crear(cliente: Cliente): Observable<BackendMessage> {
      const url = Url.url + '/api/Cliente/Crear';
      return this.http.post<BackendMessage>(url, cliente);
    }

    //me trae todos los clientes
    getListClientes(): Observable<Cliente[]> {  
      const url = Url.url + '/api/Cliente/ListaClientes';
      return this.http.get<Cliente[]>(url);
    }

   //este metodo usare para asignar un proveedor al momento de hacer una venta
    getListClienteActivos(): Observable<Cliente[]> {  
      const url = Url.url + '/api/Cliente/ListaClientesActivos';
      return this.http.get<Cliente[]>(url);
    }

    cambiarEstadoCliente(id: number, esActivo: boolean): Observable<BackendMessage> {
      return this.http.put<BackendMessage>(`${Url.url}/api/Cliente/cambiar-estado/${id}`, { esActivo });
    }

    ModificarCliente(id: number, encabezado: Cliente): Observable<BackendMessage> {
      const url = `${Url.url}/api/Cliente/actualiza-cliente/${id}`;
      return this.http.put<BackendMessage>(url, encabezado);
    }

}
