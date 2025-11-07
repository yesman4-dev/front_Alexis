import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BodegaService } from 'src/app/services/bodega.service';
import { CompraService } from 'src/app/services/compra.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-inventario',
  templateUrl: './modal-inventario.component.html',
  styleUrls: ['./modal-inventario.component.css']
})
export class ModalInventarioComponent implements OnInit {

  loteForm: FormGroup;
  lotes: any[] = [];
  dataSource = new MatTableDataSource<any>();
  columnas: string[] = ['bodegaId', 'fechaVencimiento', 'cantidad', 'acciones'];
  Bodegalista: Catalogos[] = [];

  constructor(
    private bodegaService: BodegaService,
    private compraService: CompraService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalInventarioComponent>
  ) {
    this.loteForm = this.fb.group({
      fechaVencimiento: [''],
      cantidad: [''],
      bodegaId: [''],
      precioCompraUnitario :[0]
    });

    this.lotes = []; // se inicializa como arreglo vacío
    this.dataSource.data = this.lotes;
  }

  ngOnInit(): void {
    this.obtenerBodegas();
  }

  obtenerBodegas(): void {
    this.bodegaService.getListBodegas().subscribe(
      (data) => {
        this.Bodegalista = data;
      },
      (error) => {
        console.error('Error al obtener las Bodegas de productos', error);
      }
    );
  }

 guardarInventario(): void {
  // Verificamos si hay al menos un lote
  if (this.lotes.length === 0) {
    this.toastr.warning('Debes agregar al menos un lote');
    return;
  }

  // Usamos el precio del primer lote como referencia para el precio de compra
  const precioCompra = parseFloat(this.lotes[0].precioCompraUnitario);

  const data = {
    productoId: this.data.productoId,
    precioCompraUnitario: precioCompra,
    lotes: this.lotes.map(lote => ({
      fechaVencimiento: lote.fechaVencimiento,
      stockActual: lote.cantidad,
      bodegaId: lote.bodegaId,
    }))
  };

 // console.log("Payload enviado:", data);

  this.compraService.registrarInventarioInicial([data]).subscribe(
    res => {
      if (res.data) {
        this.toastr.success(res.mensaje, "Éxito");
        this.dialogRef.close(true);
      } else {
        this.toastr.info(res.mensaje, "Validar");
      }
    },
    err => {
      console.error(err);
      this.toastr.error('Error al actualizar inventario');
    }
  );
}

agregarLote(): void {
  const { bodegaId, fechaVencimiento, cantidad, precioCompraUnitario } = this.loteForm.value;

  if (bodegaId && fechaVencimiento && cantidad > 0 && precioCompraUnitario > 0) {
    this.lotes.push({
      bodegaId,
      fechaVencimiento,
      cantidad,
      precioCompraUnitario: parseFloat(precioCompraUnitario) // ← conversión explícita
    });

    this.dataSource.data = [...this.lotes]; // spread para forzar update
    this.loteForm.reset();
  } else {
    this.toastr.warning('Completa todos los campos del lote correctamente');
  }
}


  getDescripcionBodega(id: number): string {
    const bodega = this.Bodegalista.find(u => u.id === id);
    return bodega ? bodega.descripcion : '';
  }

  eliminarLote(lote: any): void {
    this.lotes = this.lotes.filter(l => l !== lote);
    this.dataSource.data = this.lotes;
  }

 

  cerrar(): void {
    this.dialogRef.close();
  }
}
