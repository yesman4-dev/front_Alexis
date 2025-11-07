import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Login } from '../Clases/login';
import { Proveedor } from '../Clases/proveedor';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(private http: HttpClient) { }

    //metodo para crear un proveedor
    Crear(proveedor: Proveedor): Observable<BackendMessage> {
      const url = Url.url + '/api/Proveedor/Crear';
      return this.http.post<BackendMessage>(url, proveedor);
    }

   getListProveedores(): Observable<Proveedor[]> {  
      const url = Url.url + '/api/Proveedor/ListaProveedores';
      return this.http.get<Proveedor[]>(url);
    }

    //este metodo usare para asignar un proveedor al momento de hacer una compra
    getListProveedoresActivos(): Observable<Proveedor[]> {  
      const url = Url.url + '/api/Proveedor/ListaProveedoresactivos';
      return this.http.get<Proveedor[]>(url);
    }

    cambiarEstadoProveedor(id: number, esActivo: boolean): Observable<BackendMessage> {
      return this.http.put<BackendMessage>(`${Url.url}/api/Proveedor/cambiar-estado/${id}`, { esActivo });
    }

     ModificarProveedor(id: number, encabezado: Proveedor): Observable<BackendMessage> {
      const url = `${Url.url}/api/Proveedor/actualiza-proveedor/${id}`;
      return this.http.put<BackendMessage>(url, encabezado);
    }


}
