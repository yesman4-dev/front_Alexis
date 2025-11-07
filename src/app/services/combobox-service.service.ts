import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Combobox } from '../modelos/combobox';
import { Observable } from 'rxjs';
import { Url } from '../modelos/url';


@Injectable({
  providedIn: 'root'
})
export class ComboboxServiceService {

  constructor(private http: HttpClient) { }

  getlistRoles():Observable <Combobox[]>{ 
    const url = Url.url + '/api/Roles/ListaRolUsuarios';
    return this.http.get<Combobox[]>(url);
  }

  

}
