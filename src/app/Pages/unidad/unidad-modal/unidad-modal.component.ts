import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { UnidadmedidaService } from 'src/app/services/unidadmedida.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-unidad-modal',
  templateUrl: './unidad-modal.component.html',
  styleUrls: ['./unidad-modal.component.css']
})
export class UnidadModalComponent {
  unidadForm: FormGroup;

    constructor(
          private unidadmedidaService: UnidadmedidaService,
          private fb: FormBuilder,
          private toastr: ToastrService,
          private dialogRef: MatDialogRef<UnidadModalComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private dialog: MatDialog,
    ){
  
      this.unidadForm = this.fb.group({
        descripcion: [this.data.unidad.descripcion, Validators.required],
        esActivo: [this.data.unidad.esActivo],
     
      });
    }

    Actualizarunidad(){
      if (this.unidadForm.invalid) return;
  
      const datosActualizados: Catalogos = this.unidadForm.value;
      this.unidadmedidaService.ModificarUnidades(this.data.unidad.id, datosActualizados).subscribe(
        (response) => {

          if(response.data == true){
            this.toastr.success(response.mensaje, "Exito");
            this.cerrar()
          }else{
            this.toastr.info(response.mensaje, "Error");
          }

       
        },
        (error) => {
          this.toastr.error('Error al actualizar los datos', "Error");
      
        }
      );
    }
  
  cerrar(){
    this.dialogRef.close()
  }

  // Para poner un usuario ya sea activo o no
    onDisponibleChange(event: any): void {
      const esActivo = event.checked; // Valor actual del toggle (true o false)
  
      // Mostrar la alerta de confirmación
      Swal.fire({
        title: '¿Estás seguro?',
        text: esActivo ? '¿Quieres habilitar el registro?' : '¿Quieres deshabilitar el registro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, aplicar cambios',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, llama al servicio para actualizar el estado en el backend
          this.unidadmedidaService.cambiarEstadoUnidad(this.data.unidad.id, esActivo).subscribe({
            next: (respuesta: any) => {
  
              if (respuesta.data == true) {
                this.toastr.success(respuesta.mensaje, 'Actualización Exitosa');
              } else {
                this.toastr.info(respuesta.mensaje, 'Atención');
              }
            },
            error: (error) => {
              this.toastr.error('No se pudo actualizar el estado.', 'Error');
             // console.error('Error al cambiar estado:', error);
  
              // Revertir el cambio en el toggle si hubo un error
              this.unidadForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
            },
          });
        } else {
          // Si el usuario cancela, revertir el cambio en el toggle
          this.unidadForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
        }
      });
    }
}
