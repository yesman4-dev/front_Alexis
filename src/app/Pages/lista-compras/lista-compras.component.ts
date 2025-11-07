import { Component, OnInit } from '@angular/core';
import { CompraService } from 'src/app/services/compra.service';
import { ToastrService } from 'ngx-toastr';
import { Compras } from 'src/app/Clases/compras';
import { ModaldetalleComprasComponent } from '../modaldetalle-compras/modaldetalle-compras.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-lista-compras',
  templateUrl: './lista-compras.component.html',
  styleUrls: ['./lista-compras.component.css']
})
export class ListaComprasComponent implements OnInit, AfterViewInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  listacompras: Compras [] = [];
  filteredCompras: Compras[] = [];
  displayedColumns: string[] = ['id', 'fechaRegistro', 'totalCompra', 'usuarioNombre', 'proveedorNombre', 'tipoTransaccionNombre', 'acciones'];
  dataSource = new MatTableDataSource<Compras>();
  filteredDataSource = new MatTableDataSource<Compras>();

  constructor(
    private toastr: ToastrService,
    private dialog: MatDialog,
    private compraService: CompraService
  ) {}

  
    ngAfterViewInit(): void {
      this.filteredDataSource.paginator = this.paginator;
    }


    ngOnInit(): void {
      this.obtenerListaCompras();
    }




    eliminarCompra(compra: Compras) {
       if (!compra || !compra.id) return;

      Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción eliminará la compra y todo lo relacionado. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Eliminando...',
            text: 'Por favor espere...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          this.compraService.EliminarCompra(compra.id!).subscribe({
            next: (res) => {
              Swal.fire('¡Eliminado!', res.mensaje, 'success');
              this.obtenerListaCompras();
            },
            error: (err) => {
              const msg = err.error?.mensaje || 'No se pudo eliminar la compra.';
              Swal.fire('Error', msg, 'error');
            }
          });
        }
      });
    }

  
    revertirTipoCompra(compra: Compras) {
      if (!compra || !compra.id) return;

      Swal.fire({
        title: '¿Está seguro?',
        text: `¿Desea cambiar esta compra de tipo ${compra.tipoTransaccionNombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Procesando...',
            text: 'Por favor espere...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          this.compraService.RevertirTipoCompra(compra.id!).subscribe({
            next: (res) => {
              Swal.fire('¡Éxito!', res.mensaje, 'success');
              this.obtenerListaCompras();
            },
            error: (err) => {
              const msg = err.error?.mensaje || 'No se pudo revertir la compra.';
              Swal.fire('Error', msg, 'error');
            }
          });
        }
      });
    }

        // Método que manejará la acción del botón
    verDetalleCompra(compra: Compras) {
      this.dialog.open(ModaldetalleComprasComponent, {
         width: '700px',
         data: compra
       });
    }

    obtenerListaCompras(): void {
      this.compraService.getListCompras().subscribe(
        (data) => {
          this.listacompras = data;
          this.filteredCompras = [...data]; // Al principio mostramos todas las compras
          
          this.dataSource.data = data;
          this.filteredDataSource.data = data;
        },
        (error) => {
          //console.error('Error al obtener las Compras', error);
        }
      );
    }

    onSearchChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      const searchValue = input.value.toLowerCase();

      if (searchValue) {
        const resultados = this.listacompras.filter(compra =>
          compra.id?.toString().includes(searchValue) ||
          compra.proveedorNombre?.toLowerCase().includes(searchValue) || // 👈 aquí lo corregimos
          compra.totalCompra.toString().includes(searchValue)
        );
        this.filteredDataSource.data = resultados;
      } else {
        this.filteredDataSource.data = [...this.listacompras];
      }
    }


  onSearchChangeFecha(searchDate: any): void {
  if (searchDate) {
    const selectedDate = new Date(searchDate);
    const resultados = this.listacompras.filter(compra => {
      const compraDate = new Date(compra.fechaRegistro!);
      return compraDate.toLocaleDateString() === selectedDate.toLocaleDateString();
    });
    this.filteredDataSource.data = resultados;
  } else {
    this.filteredDataSource.data = [...this.listacompras];
  }
}




    
}
