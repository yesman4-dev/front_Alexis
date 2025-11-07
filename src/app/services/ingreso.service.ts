import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Ingreso } from '../Clases/ingreso';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class IngresoService {

 
  constructor(private http: HttpClient) { }


     //metodo para crear una compra 
  Crear(ingreso: Ingreso): Observable<BackendMessage> {
      const url = Url.url + '/api/Ingreso/Crear';
      return this.http.post<BackendMessage>(url, ingreso);
  }

  ObtenerTodos(): Observable<Ingreso[]> {
    const url = Url.url + '/api/Ingreso/todos';
    return this.http.get<Ingreso[]>(url);
  }

  Filtrar(fechaInicio: string, fechaFinal: string): Observable<BackendMessage> {
    let url = Url.url + `/api/Ingreso/filtrar?fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`;
    return this.http.get<BackendMessage>(url);
  }

}
