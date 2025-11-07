import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LaboratoriosService } from 'src/app/services/laboratorios.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-laboratorio-modal',
  templateUrl: './laboratorio-modal.component.html',
  styleUrls: ['./laboratorio-modal.component.css']
})
export class LaboratorioModalComponent {

      laboratorioForm: FormGroup;
    
        constructor(
              private LaboratoriosService: LaboratoriosService,
              private fb: FormBuilder,
              private toastr: ToastrService,
              private dialogRef: MatDialogRef<LaboratorioModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog: MatDialog,
        ){
      
          this.laboratorioForm = this.fb.group({
            descripcion: [this.data.laboratorio.descripcion, Validators.required],
            esActivo: [this.data.laboratorio.esActivo],
         
          });
        }

        ActualizarLaboratorio(){
          if (this.laboratorioForm.invalid) return;
      
          const datosActualizados: Catalogos = this.laboratorioForm.value;
          this.LaboratoriosService.ModificarLaboratorio(this.data.laboratorio.id, datosActualizados).subscribe(
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
          this.LaboratoriosService.cambiarEstadoLaboratorio(this.data.laboratorio.id, esActivo).subscribe({
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
              this.laboratorioForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
            },
          });
        } else {
          // Si el usuario cancela, revertir el cambio en el toggle
          this.laboratorioForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
        }
      });
    }

}
