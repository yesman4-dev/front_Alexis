import { Component, OnInit } from '@angular/core';
import { AudotoriaService } from 'src/app/services/audotoria.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creditos-clientes',
  templateUrl: './creditos-clientes.component.html',
  styleUrls: ['./creditos-clientes.component.css']
})
export class CreditosClientesComponent implements OnInit {
  resumenCreditos: any[] = [];
  clientesFiltrados: any[] = [];
  filtro: string = '';

  constructor(private auditoriaService: AudotoriaService,
              private router: Router
  ) {

  }

  getTotalSaldoPendiente(): number {
  return this.resumenCreditos.reduce((acc, item) => acc + (item.totalSaldoPendiente || 0), 0);
}


  ngOnInit(): void {
    this.auditoriaService.getResumenCreditosPorCliente().subscribe({
      next: data => {
        this.resumenCreditos = data;
        this.clientesFiltrados = data;
      },
      error: error => {
        console.error('Error al cargar créditos por cliente', error);
      }
    });
  }

  filtrarClientes() {
    const texto = this.filtro.toLowerCase();
    this.clientesFiltrados = this.resumenCreditos.filter(cliente =>
      cliente.nombreCliente.toLowerCase().includes(texto) ||
      (cliente.telefonoCliente && cliente.telefonoCliente.toLowerCase().includes(texto))
    );
  }


  verDetalle(clienteId: number) {
    this.router.navigate(['/credito_ventas', clienteId]);
  }


}


