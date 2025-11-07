import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class UnidadmedidaService {

  constructor(private http: HttpClient) { }

  Crear(boddy: Catalogos): Observable<BackendMessage> {
    const url = Url.url + '/api/UnidadMedida/Crear';
    return this.http.post<BackendMessage>(url, boddy);
  }

  getListUnidades(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/UnidadMedida/ListaUnidades';
    return this.http.get<Catalogos[]>(url);
  }


  getListUnidadesActivas(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/UnidadMedida/ListaUnidadesActivas';
    return this.http.get<Catalogos[]>(url);
  }

  cambiarEstadoUnidad(id: number, esActivo: boolean): Observable<BackendMessage> {
    return this.http.put<BackendMessage>(`${Url.url}/api/UnidadMedida/cambiar-estado/${id}`, { esActivo });
  }

  ModificarUnidades(id: number, encabezado: Catalogos): Observable<BackendMessage> {
    const url = `${Url.url}/api/UnidadMedida/actualiza-unidad/${id}`;
    return this.http.put<BackendMessage>(url, encabezado);
  }
}
