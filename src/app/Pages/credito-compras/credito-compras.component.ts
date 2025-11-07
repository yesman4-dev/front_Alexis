import { Component, OnInit } from '@angular/core';
import { CompraService } from 'src/app/services/compra.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ModaldetalleCreditocompraComponent } from '../modaldetalle-creditocompra/modaldetalle-creditocompra.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credito-compras',
  templateUrl: './credito-compras.component.html',
  styleUrls: ['./credito-compras.component.css']
})
export class CreditoComprasComponent implements OnInit {
filtro: string = '';
listacredito: any[] = [];
listacreditoFiltrados: any[] = [];


  constructor(
    private compraService: CompraService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerListaCreditoCompra();
  }

getTotalSaldoPendiente(): number {
  return this.listacredito.reduce((acc, item) => acc + (item.totalSaldoPendiente || 0), 0);
}


obtenerListaCreditoCompra(): void {
  this.compraService.getListCreditoCompras().subscribe(
    (data) => {
      this.listacredito = data;
      this.listacreditoFiltrados = [...data];
    },
    (error) => {
      console.error('Error al obtener resumen de créditos por proveedor', error);
    }
  );
}

  verDetalle(proveedorId: number) {
    this.router.navigate(['/credito_compras', proveedorId]);
  }

  // verDetalleProveedor(credito: any) {
  //   this.dialog.open(ModaldetalleCreditocompraComponent, {
  //     width: '700px',
  //     data: credito
  //   });
  // 


aplicarFiltro(): void {
  const valor = this.filtro.toLowerCase().trim();
  if (!valor) {
    this.listacreditoFiltrados = [...this.listacredito];
    return;
  }

  this.listacreditoFiltrados = this.listacredito.filter(c =>
    (c.nombreProveedor || '').toLowerCase().includes(valor) ||
    (c.telefono || '').toLowerCase().includes(valor)
  );
}


}
