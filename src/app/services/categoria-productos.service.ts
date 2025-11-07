import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductosService {

  constructor(private http: HttpClient) { }

  
  Crear(boddy: Catalogos): Observable<BackendMessage> {
    const url = Url.url + '/api/Categorias/Crear';
    return this.http.post<BackendMessage>(url, boddy);
  }

  getListCategorias(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/Categorias/ListaCategorias';
    return this.http.get<Catalogos[]>(url);
  }


  getListCategoriasActivas(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/Categorias/ListaCategoriasActivas';
    return this.http.get<Catalogos[]>(url);
  }

  cambiarEstadoCategoria(id: number, esActivo: boolean): Observable<BackendMessage> {
    return this.http.put<BackendMessage>(`${Url.url}/api/Categorias/cambiar-estado/${id}`, { esActivo });
  }

  ModificarCategoria(id: number, encabezado: Catalogos): Observable<BackendMessage> {
    const url = `${Url.url}/api/Categorias/actualiza-categoria/${id}`;
    return this.http.put<BackendMessage>(url, encabezado);
  }


}
