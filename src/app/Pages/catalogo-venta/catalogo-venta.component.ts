import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-catalogo-venta',
  templateUrl: './catalogo-venta.component.html',
  styleUrls: ['./catalogo-venta.component.css']
})
export class CatalogoVentaComponent implements OnInit{
  idRol: number = 0
  
  constructor(private router: Router,
     private authService: AuthService,
     private cdRef: ChangeDetectorRef,
  ) {}


  ngOnInit(): void {
       //para sacar el nombre de usuario del token
      this.authService._rolId$.subscribe(rol => {
        this.idRol = rol;
        this.cdRef.detectChanges();
      });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  
}
