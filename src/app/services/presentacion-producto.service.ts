import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class PresentacionProductoService {

  constructor(private http: HttpClient) { }

  
  Crear(boddy: Catalogos): Observable<BackendMessage> {
    const url = Url.url + '/api/PContenido/Crear';
    return this.http.post<BackendMessage>(url, boddy);
  }

  getListPContenidos(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/PContenido/ListaPresentaciones';
    return this.http.get<Catalogos[]>(url);
  }


  getListPcontenidosActivos(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/PContenido/ListaPContenidosActivas';
    return this.http.get<Catalogos[]>(url);
  }

  cambiarEstadoContenido(id: number, esActivo: boolean): Observable<BackendMessage> {
    return this.http.put<BackendMessage>(`${Url.url}/api/PContenido/cambiar-estado/${id}`, { esActivo });
  }

  ModificarPcontenido(id: number, encabezado: Catalogos): Observable<BackendMessage> {
    const url = `${Url.url}/api/PContenido/actualiza-presentacion/${id}`;
    return this.http.put<BackendMessage>(url, encabezado);
  }  

}
