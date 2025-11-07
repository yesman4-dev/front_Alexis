import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';
import { Usuarios } from 'src/app/Clases/usuarios';
import { ToastrService } from 'ngx-toastr';
import { ComboboxServiceService } from 'src/app/services/combobox-service.service';
import { Combobox } from 'src/app/modelos/combobox';
import { MatDialog } from '@angular/material/dialog';
import { ModalUsuarioComponent } from '../modal-usuario/modal-usuario.component';


@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  
  usuarioForm: FormGroup;
  listaroles: any[] =[]
  displayedColumns: string[] = ['usuarioNombre', 'telefono', 'esActivo', 'rol', 'acciones'];
  dataSource = new MatTableDataSource<Usuarios>([]);
  filteredDataSource = new MatTableDataSource<Usuarios>([]);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private comboboxServiceService: ComboboxServiceService,
    private dialog: MatDialog,
  ) {
    this.usuarioForm = this.fb.group({
      usuarioNombre: ['', Validators.required],
      clave: ['', Validators.required],
      telefono: [''],
      correo: ['', [, Validators.email]],
      rolUsuarioId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
    this.ObtenerRolesusuarios()
  }

  obtenerUsuarios(): void {
    this.authService.getListUserClientes().subscribe(
      (usuarios) => {
        this.dataSource.data = usuarios;
        this.filteredDataSource.data = usuarios; // Inicialmente, la tabla muestra todos los datos
      },
      (error) => {
        console.error('Error al obtener usuarios', error);
      }
    );
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

  filtrarUsuarios(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDataSource.data = this.dataSource.data.filter(user =>
      user.usuarioNombre.toLowerCase().includes(filtro) ||
      user.telefono?.includes(filtro) // Búsqueda en nombre o teléfono
    );
  }

  agregarUsuario(): void {
    if (this.usuarioForm.valid) {
      const nuevoUsuario: Usuarios = this.usuarioForm.value;
  
      this.authService.Crear(nuevoUsuario).subscribe(
        (response) => {

          if(response.data == true){
              // Si la creación es exitosa, mostrar un mensaje
              this.toastr.success(response.mensaje, 'Éxito');
                      
              this.obtenerUsuarios(); 
              this.usuarioForm.reset();
          }else{
            this.toastr.info(response.mensaje, 'Éxito');
          }
        
        },
        (error) => {   
          this.toastr.error('Error al crear el usuario', 'Error');
          console.error('Error al crear usuario', error);
        }
      );
    } else {
      this.toastr.warning('Por favor, completa todos los campos correctamente', 'Formulario inválido');
    }
  }
  

  editarUsuario(user: Usuarios): void {
    const dialogRef = this.dialog.open(ModalUsuarioComponent, {
      width: '80%',
      maxWidth: '400px',
      autoFocus: false,
      data: {
        usuario: user, // aqui le paso todo el usuario seleccionado al modal
      }
    });
    dialogRef.afterClosed().subscribe(result => {
     this.obtenerUsuarios()
    });
  }
  
}
