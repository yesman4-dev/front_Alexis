import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BodegaService } from 'src/app/services/bodega.service';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { Catalogos } from 'src/app/Clases/catalogos';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-modalmovimiento-bodega',
  templateUrl: './modalmovimiento-bodega.component.html',
  styleUrls: ['./modalmovimiento-bodega.component.css']
})
export class ModalmovimientoBodegaComponent implements OnInit {
  bodegasDisponibles: Catalogos[] = [];
  bodegaDestinoId: number | null = null;
  cantidad: number = 0;
  mensaje: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private bodegaService: BodegaService,
    private dialogRef: MatDialogRef<ModalmovimientoBodegaComponent>,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.cargarBodegasDisponibles();
  }

  
  cargarBodegasDisponibles(): void {
    this.bodegaService.getListBodegas().subscribe(
      (bodega) => {
        this.bodegasDisponibles  = bodega;
        //this.bodegasDisponibles = bodega.filter((b: any) => b.bodegaId !== this.data.bodegaOrigen.bodegaId);
     
      },
      (error) => {
      //  console.error('Error al obtener Bodegas', error);
      }
    );
  }



  moverProducto(): void {
    if (!this.bodegaDestinoId || this.cantidad <= 0) {
      this.toastr.info('Debe seleccionar una bodega destino y una cantidad válida.', "Valide");
      return;
    }

    const dto = {
      productoId: this.data.producto.productoId,
      bodegaOrigenId: this.data.bodegaOrigen.bodegaId,
      bodegaDestinoId: this.bodegaDestinoId,
      cantidad: this.cantidad
    };

    this.bodegaService.MoverProducto(dto).subscribe({
      next: (res: BackendMessage) => {
        if(res.data){
          this.toastr.success(res.mensaje, "Exito");
          this.dialogRef.close(true); // para recargar el inventario
        }else{
          this.toastr.info(res.mensaje, "Exito");
        }
       
      },
      error: (err) => {
        this.mensaje = 'Error al mover producto. Intente nuevamente.';
        console.error(err);
      }
    });
  }


  cerrar(){
    this.dialogRef.close()
  }
}

