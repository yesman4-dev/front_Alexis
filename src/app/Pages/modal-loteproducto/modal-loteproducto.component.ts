import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Producto } from 'src/app/Clases/producto';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BodegaService } from 'src/app/services/bodega.service';
import { Catalogos } from 'src/app/Clases/catalogos';
@Component({
  selector: 'app-modal-loteproducto',
  templateUrl: './modal-loteproducto.component.html',
  styleUrls: ['./modal-loteproducto.component.css']
})
export class ModalLoteproductoComponent implements OnInit {

  loteForm: FormGroup;
  producto: Producto
  lotes: any[] = [];
  dataSource = new MatTableDataSource<any>();
  columnas: string[] = ['bodegaId', 'fechaVencimiento', 'cantidad', 'acciones'];

  constructor(
    private bodegaService: BodegaService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalLoteproductoComponent>
  ) {

    this.producto = data.producto;
    this.lotes = [...data.lotes]; // Copia por seguridad
    this.dataSource.data = this.lotes;

    this.loteForm = this.fb.group({
      fechaVencimiento: [''],
      cantidad: [''],
      bodegaId: ['']
    });
  }

  ngOnInit(): void {
   this.obtenerBodegas()
  }

  agregarLote(): void {
    const { bodegaId, fechaVencimiento, cantidad } = this.loteForm.value;
    if (bodegaId && fechaVencimiento && cantidad) {
      this.lotes.push({ bodegaId, fechaVencimiento, cantidad });
      this.dataSource.data = this.lotes;
      this.loteForm.reset();
    }
  }

  eliminarLote(lote: any): void {
    this.lotes = this.lotes.filter(l => l !== lote);
    this.dataSource.data = this.lotes;
  }

  confirmar(): void {
    this.dialogRef.close(this.lotes);
  }


  Bodegalista: Catalogos [] = []
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
    getDescripcionBodega(id: number): string {
      const bodega = this.Bodegalista.find(u => u.id === id);
      return bodega ? bodega.descripcion : '';
    }



}
