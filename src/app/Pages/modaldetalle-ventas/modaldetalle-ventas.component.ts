import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Venta } from 'src/app/Clases/venta';
import { ReportesService } from 'src/app/services/reportes.service';
import { VentaService } from 'src/app/services/venta.service';
import { Url } from 'src/app/modelos/url';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modaldetalle-ventas',
  templateUrl: './modaldetalle-ventas.component.html',
  styleUrls: ['./modaldetalle-ventas.component.css']
})
export class ModaldetalleVentasComponent implements OnInit {

  venta!: Venta;
  cargando: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Venta | number,
    private reportesService: ReportesService,
    private ventaService: VentaService,
     private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    if (typeof this.data === 'number') {
      // Solo llegó el ID → lo buscamos
      this.ventaService.ObtenerPorId(this.data).subscribe({
        next: (res) => {
          this.venta = res;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al obtener venta por ID:', err);
          this.cargando = false;
        }
      });
    } else {
      // Ya llegó el objeto completo
      this.venta = this.data;
      this.cargando = false;
    }
  }

abrirPDF() {
  if (!this.venta?.id) return;
  const url = `${Url.url}/api/Reportes/ticket-venta/${this.venta.id}`;
  window.open(url, '_blank');
}


recalcularFila(detalle: any) {
  const detalleId = detalle.id || detalle.detalleVentaId; 
  const payload = {
    cantidad: detalle.cantidad,
    precioVentaUnitario: detalle.precioVentaUnitario
  };

  this.ventaService.EditarDetalle(detalleId, payload).subscribe({
    next: (resp) => {
         this.toastr.success(resp.mensaje, 'Éxito');
    },
    error: (err) => {
      console.error('❌ Error al actualizar detalle', err);
    }
  });
}

eliminarDetalle(detalle: any) {
  const detalleId = detalle.id || detalle.detalleVentaId;

  Swal.fire({
    title: '¿Eliminar detalle?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Eliminando...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false
      });
      
      this.ventaService.EliminarDetalle(detalleId).subscribe({
        next: (resp) => {
          // Quita el detalle eliminado de la lista en pantalla
          this.venta.detalleVentas = this.venta.detalleVentas.filter(
            d => (d.id || d.id) !== detalleId
          );

          Swal.fire({
            icon: 'success',
            title: 'Detalle eliminado',
            text: resp.mensaje || 'El detalle fue eliminado correctamente',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('❌ Error al eliminar detalle', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al intentar eliminar el detalle',
          });
        }
      });
    }
  });
}




}
