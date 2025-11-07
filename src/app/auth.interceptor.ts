import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { catchError } from 'rxjs/operators';
import { DecodedToken } from './modelos/decoded-token';
import { ToastrService } from 'ngx-toastr';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
  
    // Rutas que no requieren autenticación
    const noAuthRequired = [
      '/login',
      '/api/PerfilEmpresa',  // Ruta de la API para obtener la info de la empresa
    ];
  
    // Si la ruta es una de las excepciones, no se añade el token
    if (noAuthRequired.some((url) => request.url.includes(url))) {
      return next.handle(request);
    }
  
    if (!token) {
      this.handleUnauthorized();
      this.toastr.warning('Inicie sesión.', 'Advertencia');
      return throwError(() => new Error('No autorizado: redirigiendo al login'));
    }
      
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);

      const expirationDate = new Date(0); // Epoch time
      expirationDate.setUTCSeconds(decodedToken.exp);

      if (expirationDate < new Date()) {
        console.warn('El token ha expirado');
        this.toastr.error('Su sesión ha expirado. Vuelva a iniciar sesión.', 'Sesión expirada');
        this.handleUnauthorized();
        return throwError(() => new Error('Token expirado: redirigiendo al login'));
      }

    } catch (error) {
      console.error('Error al decodificar el token:', error);
      this.handleUnauthorized();
      return throwError(() => new Error('Token inválido: redirigiendo al login'));
    }

  
    // Clonar la solicitud y agregar el token al header
    const authRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  
    // Manejo de errores en la respuesta
    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.toastr.error('No autorizado: Por favor, inicie sesión.', 'Error');
          this.handleUnauthorized();
        }
        return throwError(() => error);
      })
    );
  }
  

  // Manejo centralizado de redirección al login y cierre de sesión
  private handleUnauthorized(): void {
    this.router.navigate(['/login']);
  }
}
