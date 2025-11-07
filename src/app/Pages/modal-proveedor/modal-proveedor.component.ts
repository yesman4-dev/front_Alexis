import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { Proveedor } from 'src/app/Clases/proveedor';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { ModalclaveUsuarioComponent } from '../modalclave-usuario/modalclave-usuario.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-proveedor',
  templateUrl: './modal-proveedor.component.html',
  styleUrls: ['./modal-proveedor.component.css']
})
export class ModalProveedorComponent implements OnInit{

  proveedorForm: FormGroup;

  constructor(
        private proveedorService: ProveedorService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private dialogRef: MatDialogRef<ModalProveedorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
  ){

    this.proveedorForm = this.fb.group({
      nombreProveedor: [this.data.proveedor.nombreProveedor, Validators.required],
      //clave: [this.data.usuario.clave, Validators.required],
      telefono: [this.data.proveedor.telefono],
      direccion: [this.data.proveedor.direccion],
      esActivo: [this.data.proveedor.esActivo], // este me gustaria que fuera un  mat-slide-toggle
   
    });
  }


  ngOnInit(): void {
   
  }

    ActualizarProveedor(){
      if (this.proveedorForm.invalid) return;
  
      const datosActualizados: Proveedor = this.proveedorForm.value;
      this.proveedorService.ModificarProveedor(this.data.proveedor.id, datosActualizados).subscribe(
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
      text: esActivo ? '¿Quieres habilitar el proveedor?' : '¿Quieres deshabilitar el proveedor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar cambios',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, llama al servicio para actualizar el estado en el backend
        this.proveedorService.cambiarEstadoProveedor(this.data.proveedor.id, esActivo).subscribe({
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
            this.proveedorForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
          },
        });
      } else {
        // Si el usuario cancela, revertir el cambio en el toggle
        this.proveedorForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
      }
    });
  }

}
