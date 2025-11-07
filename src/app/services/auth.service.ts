import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Login } from '../Clases/login';
import { Usuarios } from '../Clases/usuarios';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Subscription, interval  } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../modelos/decoded-token';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private _username = new BehaviorSubject<string>(''); 
  username$ = this._username.asObservable();

  private _userId = new BehaviorSubject<number>(0);  // Cambiar a number
  // Nuevo BehaviorSubject para almacenar el ID del usuario
  userId$ = this._userId.asObservable(); // Exponerlo como observable para que otros componentes puedan suscribirse

  private _rolId = new BehaviorSubject<number>(0);  // Cambiar a number
  // Nuevo BehaviorSubject para almacenar el rol Id usuario
  _rolId$ = this._rolId.asObservable(); // Exponerlo como observable para que otros componentes puedan suscribirse

  //para manejar el vencimiento del token 
    private sessionTimeSubject = new BehaviorSubject<number>(0);
  sessionTime$ = this.sessionTimeSubject.asObservable();

  private sessionTimerSubscription: Subscription | null = null;

 
  constructor(private http: HttpClient) { 
    this.checkToken();
  }

  checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        this._isLoggedIn.next(true); //veo si hay login
        this._username.next(decoded.unique_name || 'Usuario');//capturo el nombre del usuario
        this._userId.next(decoded.nameid ); // capturo el Id del usuario
        this._rolId.next(Number(decoded.role));
         this.startSessionTimer(decoded.exp);
      } catch {
        this._isLoggedIn.next(false);
        this._username.next('');
        this._userId.next(0); // Si el token no es válido, limpiar el id
        this._rolId.next(0);
      }
    } else {
      this._isLoggedIn.next(false);
      this._username.next('');
      this._userId.next(0); // No hay token, no hay id
      this._rolId.next(0);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this._isLoggedIn.next(false);
    this._username.next('');
    this._rolId.next(0)
      this.stopSessionTimer();
  }
  
    private startSessionTimer(expirationTime: number): void {
    this.stopSessionTimer(); // Por si ya había uno corriendo

    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(expirationTime);

    this.sessionTimerSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / 1000)); // en segundos
      this.sessionTimeSubject.next(diff);

      if (diff === 0) {
        this.logout();
      }
    });
  }

    private stopSessionTimer(): void {
    if (this.sessionTimerSubscription) {
      this.sessionTimerSubscription.unsubscribe();
      this.sessionTimerSubscription = null;
    }
  }

  login(token: string) {
    localStorage.setItem('token', token);
    this.checkToken(); // 🔥 ACTUALIZA automáticamente

  }

  get isLoggedInValue(): boolean {
    return this._isLoggedIn.getValue();
  }
  
  get usernameValue(): string {
    return this._username.getValue();
  }

  get userIdValue(): number { // Método para obtener el id del usuario desde el BehaviorSubject
    return this._userId.getValue();
  }

  get rolIdValue(): number { // Método para obtener el rol Id  del usuario desde el BehaviorSubject
    return this._rolId.getValue();
  }
  

    //metodo para hacer login
    Login(login: Login): Observable<BackendMessage> {
      const url = Url.url + '/api/Usuario/login';
      return this.http.post<BackendMessage>(url, login);
    }

    //metodo para crear un usuario
    Crear(usuario: Usuarios): Observable<BackendMessage> {
      const url = Url.url + '/api/Usuario/Crear';
      return this.http.post<BackendMessage>(url, usuario);
    }

    getListUserClientes(): Observable<Usuarios[]> {  // para ver todos los user clientes
      const url = Url.url + '/api/Usuario/ListaUsuarios';
      return this.http.get<Usuarios[]>(url);
    }

    cambiarEstadoUsuario(id: number, esActivo: boolean): Observable<BackendMessage> {
      return this.http.put<BackendMessage>(`${Url.url}/api/Usuario/cambiar-estado/${id}`, { esActivo });
    }

    ModificarUsuario(id: number, encabezado: Usuarios): Observable<BackendMessage> {
      const url = `${Url.url}/api/Usuario/actualiza-usuario/${id}`;
      return this.http.put<BackendMessage>(url, encabezado);
    }


    ModificarClaveUsuario(id: number, clave: string): Observable<BackendMessage> {
      const url = `${Url.url}/api/Usuario/actualiza-clave/${id}`;
      const body = { clave };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
      return this.http.put<BackendMessage>(url, body, { headers });
    }
    
    


}
