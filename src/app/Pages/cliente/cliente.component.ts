import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Cliente } from 'src/app/Clases/cliente';
import { ClienteService } from 'src/app/services/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ModalClienteComponent } from '../modal-cliente/modal-cliente.component';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit{

    idRol: number = 0
    clienteForm: FormGroup;
    displayedColumns: string[] = ['rtn', 'nombreCliente', 'esActivo', 'telefono', 'ciclos', 'acciones'];
    dataSource = new MatTableDataSource<Cliente>([]);
    filteredDataSource = new MatTableDataSource<Cliente>([]);
    

  constructor(
        private clienteService: ClienteService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private authService: AuthService // ✅ inyectado
  ){
  
    this.clienteForm = this.fb.group({
      nombreCliente: ['', Validators.required],
      rtn: [''],
      direccion: [''],
      correo: [''],
      telefono: ['']
    });
  }

  ngOnInit(): void {       
    
    // ID del rol
    this.authService._rolId$.subscribe(rol => {
      this.idRol = rol;
      this.cdRef.detectChanges();
    });
    
    this.obtenerClientes()
  }


  obtenerClientes(): void {
    this.clienteService.getListClientes().subscribe(
      (cliente) => {
        this.dataSource.data = cliente;
        this.filteredDataSource.data = cliente; // Inicialmente, la tabla muestra todos los datos
      },
      (error) => {
        //console.error('Error al obtener proveedores', error);
      }
    );
  }

  filtrarClientes(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDataSource.data = this.dataSource.data.filter(user =>
      (user.rtn ?? '').toLowerCase().includes(filtro) ||
      (user.nombreCliente ?? '').toLowerCase().includes(filtro) ||
      (user.telefono ?? '').toLowerCase().includes(filtro)
    );
  }
  


    agregarCliente(): void {
      if (this.clienteForm.valid) {
        const nuevoCliente: Cliente = this.clienteForm.value;
    
        this.clienteService.Crear(nuevoCliente).subscribe(
          (response) => {
  
            if(response.data == true){
                // Si la creación es exitosa, mostrar un mensaje
                this.toastr.success(response.mensaje, 'Éxito');
                        
                this.obtenerClientes(); 
                this.clienteForm.reset();
            }else{
              this.toastr.info(response.mensaje, 'Éxito');
            }
          
          },
          (error) => {   
            this.toastr.error('Error al crear el Cliente', 'Error');
            //console.error('Error al crear usuario', error);
          }
        );
      } else {
        this.toastr.warning('Por favor, completa todos los campos rrequeridos', 'Formulario inválido');
      }
    }


     editarproveedor(cliente: Cliente): void {
        const dialogRef = this.dialog.open(ModalClienteComponent, {
          width: '80%',
          maxWidth: '400px',
          autoFocus: false,
          data: {
            cliente: cliente, // aqui le paso la fila seleccionada al modal
          }
        });
        dialogRef.afterClosed().subscribe(result => {
         this.obtenerClientes()
        });
     }

}
