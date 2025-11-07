import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';

@Injectable({
  providedIn: 'root'
})
export class PefilEmpresaService {

  constructor(private http: HttpClient) { }

   
  getListPerfilEmpresa(): Observable<any[]> {  
     const url = Url.url + '/api/PerfilEmpresa/ListaEmpresa';
     return this.http.get<any[]>(url);
  }


  ModificarEmpresa(id: number, cuerpo: any): Observable<BackendMessage> {
    const url = `${Url.url}/api/PerfilEmpresa/actualiza-empresa/${id}`;
    return this.http.put<BackendMessage>(url, cuerpo);
  }

}
