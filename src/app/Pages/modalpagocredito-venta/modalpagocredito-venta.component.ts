import { Component, OnInit,Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { VentaService } from 'src/app/services/venta.service';
import { MatDialog } from '@angular/material/dialog';
import { ReportesService } from 'src/app/services/reportes.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-modalpagocredito-venta',
  templateUrl: './modalpagocredito-venta.component.html',
  styleUrls: ['./modalpagocredito-venta.component.css']
})
export class ModalpagocreditoVentaComponent implements OnInit{
  pagoForm: FormGroup;
  idUser: number = 0

  constructor(
    private cdRef: ChangeDetectorRef,
        private authService: AuthService,
        private reportesService: ReportesService,
        private ventaService: VentaService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private dialogRef: MatDialogRef<ModalpagocreditoVentaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
  ){
    this.pagoForm = this.fb.group({
      observacion: ['', Validators.required],
      montoPagado: [0, Validators.required],
    });
  }

  ngOnInit(): void {
      this.authService.userId$.subscribe(id => {
      this.idUser = id;
      this.cdRef.detectChanges();
    });
  }

  confirmarAbono() {
    if (this.pagoForm.valid) {
      const abono = {
        ...this.pagoForm.value,
        usuarioId: this.idUser
      };
  
      this.ventaService.PagarSaldoCreditoVentas(this.data.id, abono).subscribe({
        next: (resp) => {
          if (resp.data) {
            this.toastr.success(resp.mensaje, 'Pagado');
            this.dialogRef.close(true);
          } else {
            this.toastr.error(resp.mensaje, 'Error 😓');
          }
        },
        error: () => {
          this.toastr.error('Error al realizar el abono 😓');
        }
      });
    }
  }
  
  
  cerrar() {
    this.dialogRef.close();
  }

}
