import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class TipoTransaccionService {

  constructor(private http: HttpClient) { }

  getListTipoTransaccion(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/TipoTransaccion/ListaTipoTransaccion';
    return this.http.get<Catalogos[]>(url);
  }


}
