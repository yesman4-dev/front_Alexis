import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteService } from 'src/app/services/cliente.service';
import { Cliente } from 'src/app/Clases/cliente';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-cliente',
  templateUrl: './modal-cliente.component.html',
  styleUrls: ['./modal-cliente.component.css']
})
export class ModalClienteComponent implements OnInit{

  clienteForm: FormGroup;

  constructor(
        private clienteService: ClienteService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private dialogRef: MatDialogRef<ModalClienteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
  ){

    this.clienteForm = this.fb.group({
      nombreCliente: [this.data.cliente.nombreCliente, Validators.required],
      rtn: [this.data.cliente.rtn],
      direccion: [this.data.cliente.direccion],
      telefono: [this.data.cliente.telefono],
      esActivo: [this.data.cliente.esActivo],
   
    });
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

   ActualizarCliente(){
        if (this.clienteForm.invalid) return;
    
        const datosActualizados: Cliente = this.clienteForm.value;
        this.clienteService.ModificarCliente(this.data.cliente.id, datosActualizados).subscribe(
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
          this.clienteService.cambiarEstadoCliente(this.data.cliente.id, esActivo).subscribe({
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
              this.clienteForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
            },
          });
        } else {
          // Si el usuario cancela, revertir el cambio en el toggle
          this.clienteForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
        }
      });
    }

}
