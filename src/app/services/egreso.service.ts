import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Egreso } from '../Clases/egreso';
import { Catalogos } from '../Clases/catalogos';


@Injectable({
  providedIn: 'root'
})
export class EgresoService {

  constructor(private http: HttpClient) { }

     //metodo para crear una compra 
    Crear(egreso: Egreso): Observable<BackendMessage> {
        const url = Url.url + '/api/Egreso/Crear';
        return this.http.post<BackendMessage>(url, egreso);
    }

    ObtenerTodos(): Observable<Egreso[]> {
      const url = Url.url + '/api/Egreso/todos';
      return this.http.get<Egreso[]>(url);
    }

    ObtenerTipoEgresos(): Observable<Catalogos[]> {
      const url = Url.url + '/api/Egreso/tipoEgresos';
      return this.http.get<Catalogos[]>(url);
    }

    Filtrar(fechaInicio: string, fechaFinal: string, tipoEgresoId?: number): Observable<BackendMessage> {
      let url = Url.url + `/api/Egreso/filtrar?fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`;
      if (tipoEgresoId) {
          url += `&tipoEgresoId=${tipoEgresoId}`;
      }
      return this.http.get<BackendMessage>(url);
    }

  
}
