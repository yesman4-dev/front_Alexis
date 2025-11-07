import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from './modelos/decoded-token';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  // Rutas permitidas SOLO para usuarios con rol 2
  rutasPermitidasRol2: RegExp[] = [
    /^\/add_venta$/,
    /^\/lista_ventas$/,
    /^\/admin_ventas$/,
    /^\/admin_inventario$/,
    /^\/editar_producto$/,
    /^\/detalle_bodegas$/,
    /^\/cotizar$/,
  ];

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const TipoUser = Number(decodedToken.role);
      const urlActual = state.url;

      if (TipoUser === 1) {
        // Usuario admin, acceso total
        return true;
      }

      if (TipoUser === 2) {
        // Usuario tipo 2, solo acceso a ciertas rutas
        const tieneAcceso = this.rutasPermitidasRol2.some((ruta) => ruta.test(urlActual));
        if (tieneAcceso) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }

      // Por defecto, negar acceso
      this.router.navigate(['/login']);
      return false;

    } catch (error) {
      console.error('Error al decodificar el token:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
