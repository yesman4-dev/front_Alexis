import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';
import { Usuarios } from 'src/app/Clases/usuarios';
import { ToastrService } from 'ngx-toastr';
import { ComboboxServiceService } from 'src/app/services/combobox-service.service';
import { Combobox } from 'src/app/modelos/combobox';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { ModalclaveUsuarioComponent } from '../modalclave-usuario/modalclave-usuario.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css']
})
export class ModalUsuarioComponent implements OnInit{
  usuarioForm: FormGroup;
  listaroles: any[] =[]

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private comboboxServiceService: ComboboxServiceService,
    private dialogRef: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
  ){
    this.usuarioForm = this.fb.group({
      usuarioNombre: [this.data.usuario.usuarioNombre, Validators.required],
      //clave: [this.data.usuario.clave, Validators.required],
      telefono: [this.data.usuario.telefono],
      correo: [this.data.usuario.correo, [, Validators.email]],
      esActivo: [this.data.usuario.esActivo], // este me gustaria que fuera un  mat-slide-toggle
      rolUsuarioId: [this.data.usuario.rolUsuarioId, Validators.required],
      nuevaContrasena: ['']
    });
  }

  ngOnInit(): void {

     this.ObtenerRolesusuarios()
  }


  mostrarModalCambioClave() {
    this.dialog.open(ModalclaveUsuarioComponent, {
      width: '400px',
      data: { usuarioId: this.data.usuario.id } // Pasar ID del usuario
    });
  }

  ObtenerRolesusuarios(): void{
    this.comboboxServiceService.getlistRoles()
      .subscribe(data => {
        this.listaroles = data;
      },
    (error) => {
      this.toastr.error('Se perdio la conexion con el servidor', 'Error');
      });
  }

  ActualizarUsuario(){
    if (this.usuarioForm.invalid) return;

    const datosActualizados: Usuarios = this.usuarioForm.value;
    this.authService.ModificarUsuario(this.data.usuario.id, datosActualizados).subscribe(
      (response) => {
        this.toastr.success(response.mensaje, "Exito");
        this.cerrar()
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
      text: esActivo ? '¿Quieres habilitar el usuario?' : '¿Quieres deshabilitar el usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar cambios',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, llama al servicio para actualizar el estado en el backend
        this.authService.cambiarEstadoUsuario(this.data.usuario.id, esActivo).subscribe({
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
            this.usuarioForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
          },
        });
      } else {
        // Si el usuario cancela, revertir el cambio en el toggle
        this.usuarioForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
      }
    });
  }



}
