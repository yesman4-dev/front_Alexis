// ModalRebajarStockComponent.ts
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-modal-rebajar-stokk',
  templateUrl: './modal-rebajar-stokk.component.html',
  styleUrls: ['./modal-rebajar-stokk.component.css']
})
export class ModalRebajarStokkComponent {

  cantidad: number = 1;

  constructor(
    public dialogRef: MatDialogRef<ModalRebajarStokkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmar() {
    if (this.cantidad > 0 && this.cantidad <= this.data.stockActual) {
      this.dialogRef.close(this.cantidad);
    }
  }

  cerrar() {
    this.dialogRef.close(null);
  }

}
