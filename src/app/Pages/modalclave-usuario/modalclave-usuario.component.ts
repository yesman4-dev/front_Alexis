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

@Component({
  selector: 'app-modalclave-usuario',
  templateUrl: './modalclave-usuario.component.html',
  styleUrls: ['./modalclave-usuario.component.css']
})
export class ModalclaveUsuarioComponent implements OnInit{
  mostrarContrasena = false;
  ocultarClave = true;

  claveForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private comboboxServiceService: ComboboxServiceService,
    private dialogRef: MatDialogRef<ModalclaveUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuarioId: number }
  ){
    this.claveForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
  
  }

    
  actualizarClave() {
    if (this.claveForm.invalid) {
      this.toastr.warning("Ingrese una contraseña válida", "Advertencia");
      return;
    }
  
    const nuevaClave = this.claveForm.value.nuevaContrasena; // Obtener la clave del formulario
  
    this.authService.ModificarClaveUsuario(this.data.usuarioId, nuevaClave).subscribe(
      response => {
        this.toastr.success(response.mensaje, "Éxito");
        this.dialogRef.close();
      },
      error => {
        console.log(error);
        this.toastr.error("Error al actualizar la contraseña", "Error");
      }
    );
  }
  

  cerrar(){
    this.dialogRef.close()
  }
}
