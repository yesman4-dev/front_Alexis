import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Compras } from 'src/app/Clases/compras';
import { ReportesService } from 'src/app/services/reportes.service';
import { CompraService } from 'src/app/services/compra.service';

@Component({
  selector: 'app-modaldetalle-compras',
  templateUrl: './modaldetalle-compras.component.html',
  styleUrls: ['./modaldetalle-compras.component.css']
})
export class ModaldetalleComprasComponent implements OnInit {

  compra!: Compras;
  cargando: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Compras | number,
    private reportesService: ReportesService,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    if (typeof this.data === 'number') {
      // Solo llegó el ID → lo buscamos
      this.compraService.getCompraPorId(this.data).subscribe({
        next: (res) => {
          this.compra = res;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al obtener compra por ID:', err);
          this.cargando = false;
        }
      });
    } else {
      // Ya llegó el objeto completo
      this.compra = this.data;
      this.cargando = false;
    }
  }

  descargarPDF() {
    if (!this.compra?.id) return;

    this.reportesService.obtenerTicketCompraPDF(this.compra.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url); // opcional
    }, error => {
      console.error('Error al abrir el PDF', error);
    });
  }
}
