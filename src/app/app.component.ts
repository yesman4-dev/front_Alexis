import { Component, ViewChild, OnInit, ChangeDetectorRef, HostListener  } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'System';
  username: string = '';
  isLoggedIn: boolean = false;

  idRol: number = 0

  sessionTime: number = 0;


  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  isExpanded = false;

  menuItems: { label: string; icon: string; route: string }[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService // ✅ inyectado
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl + F para abrir /add_venta
    if (event.ctrlKey && event.key.toLowerCase() === 'f') {
      event.preventDefault(); // Previene que se abra la búsqueda del navegador
      this.router.navigate(['/add_venta']);
    }
  }

  ngOnInit() {
    // aqui se si hay login
    this.authService.isLoggedIn$.subscribe(isLogged => {
      this.isLoggedIn = isLogged;
      this.cdRef.detectChanges();
    });

    // de aqui saco el nombre del usuario
    this.authService.username$.subscribe(name => {
      this.username = name;
      this.cdRef.detectChanges();
    });

    // ID del rol
  
    this.authService._rolId$.subscribe(rol => {
      this.idRol = rol;
      this.construirMenu(rol); // ← reconstruimos el menú con el rol actualizado
      this.cdRef.detectChanges();
    });

     this.authService.sessionTime$.subscribe(time => {
      this.sessionTime = time;
    });


    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isExpanded = !result.matches;
    });
  }

  
formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours < 10 ? '0' + hours : hours;
  const mm = minutes < 10 ? '0' + minutes : minutes;
  const ss = seconds < 10 ? '0' + seconds : seconds;

  return `${hh}:${mm}:${ss}`;
}


  private construirMenu(rolId: number) {
    const todosLosItems = [
      { label: 'Dashboard', icon: 'dashboard', route: '/dash' },
      { label: 'Inventario', icon: 'inventory', route: '/admin_inventario' },
      { label: 'Compras', icon: 'inventory', route: '/admin_compras' },
      { label: 'Proveedores', icon: 'local_shipping', route: '/proveedor' },
      { label: 'Ventas', icon: 'shopping_cart', route: '/admin_ventas' },
      { label: 'Trueque', icon: 'settings', route: '/Trueque' },
      { label: 'Usuarios', icon: 'account_circle', route: '/user' },
      { label: 'Clientes', icon: 'person', route: '/cliente' },
      { label: 'Reportes', icon: 'bar_chart', route: '/reportes' },
      { label: 'Catalogos', icon: 'book', route: '/catalogo' },
      { label: 'Configuración', icon: 'settings', route: '/empresa' },
    ];

    if (rolId === 2) {
      // Solo permitidos para rol 2
      this.menuItems = todosLosItems.filter(item =>
        ['/admin_ventas', '/add_venta', '/admin_inventario','/Trueque', '/detalle_bodegas'].includes(item.route)
      );
    } else {
      this.menuItems = todosLosItems;
    }
  }

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }

  closeSidenav() {
    this.isExpanded = false;
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.idRol = 0
    this.username = '';
    this.router.navigate(['/login']);
  }

  
}
