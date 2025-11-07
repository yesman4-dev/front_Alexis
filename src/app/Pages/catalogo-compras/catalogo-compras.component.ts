import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo-compras',
  templateUrl: './catalogo-compras.component.html',
  styleUrls: ['./catalogo-compras.component.css']
})
export class CatalogoComprasComponent {

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  
}
