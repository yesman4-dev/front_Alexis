import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class LaboratoriosService {

  constructor(private http: HttpClient) { }

  
  Crear(boddy: Catalogos): Observable<BackendMessage> {
    const url = Url.url + '/api/Laboratorios/Crear';
    return this.http.post<BackendMessage>(url, boddy);
  }

  getListLaboratorios(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/Laboratorios/ListaLaboratorios';
    return this.http.get<Catalogos[]>(url);
  }


  getListLaboratoriosActivos(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/Laboratorios/ListaLaboratoriosActivos';
    return this.http.get<Catalogos[]>(url);
  }

  cambiarEstadoLaboratorio(id: number, esActivo: boolean): Observable<BackendMessage> {
    return this.http.put<BackendMessage>(`${Url.url}/api/Laboratorios/cambiar-estado/${id}`, { esActivo });
  }

  ModificarLaboratorio(id: number, encabezado: Catalogos): Observable<BackendMessage> {
    const url = `${Url.url}/api/Laboratorios/actualiza-laboratorios/${id}`;
    return this.http.put<BackendMessage>(url, encabezado);
  }

}
