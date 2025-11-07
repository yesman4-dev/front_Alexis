import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Proveedor } from 'src/app/Clases/proveedor';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ModalProveedorComponent } from '../modal-proveedor/modal-proveedor.component';


@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit{

    proveedorForm: FormGroup;
    displayedColumns: string[] = ['nombreProveedor', 'telefono', 'esActivo', 'direccion', 'acciones'];
    dataSource = new MatTableDataSource<Proveedor>([]);
    filteredDataSource = new MatTableDataSource<Proveedor>([]);
  


  constructor(
     private proveedorService: ProveedorService,
     private fb: FormBuilder,
     private toastr: ToastrService,
     private dialog: MatDialog,
  ){

    this.proveedorForm = this.fb.group({
      nombreProveedor: ['', Validators.required],
      telefono: [''],
      direccion: ['']
    });
  }

  ngOnInit(): void {
    this.obtenerProveedores()
  }

  obtenerProveedores(): void {
    this.proveedorService.getListProveedores().subscribe(
      (proveedor) => {
        this.dataSource.data = proveedor;
        this.filteredDataSource.data = proveedor; // Inicialmente, la tabla muestra todos los datos
      },
      (error) => {
        console.error('Error al obtener proveedores', error);
      }
    );
  }

  
  filtrarProveedores(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDataSource.data = this.dataSource.data.filter(user =>
      user.nombreProveedor.toLowerCase().includes(filtro) ||
      user.telefono?.includes(filtro) // Búsqueda en nombre o teléfono
    );
  }

  agregarProveedor(): void {
      if (this.proveedorForm.valid) {
        const nuevoProveedor: Proveedor = this.proveedorForm.value;
    
        this.proveedorService.Crear(nuevoProveedor).subscribe(
          (response) => {
  
            if(response.data == true){
                // Si la creación es exitosa, mostrar un mensaje
                this.toastr.success(response.mensaje, 'Éxito');
                        
                this.obtenerProveedores(); 
                this.proveedorForm.reset();
            }else{
              this.toastr.info(response.mensaje, 'Éxito');
            }
          
          },
          (error) => {   
            this.toastr.error('Error al crear el Proveedor', 'Error');
            //console.error('Error al crear usuario', error);
          }
        );
      } else {
        this.toastr.warning('Por favor, completa todos los campos correctamente', 'Formulario inválido');
      }
    }

      editarproveedor(proveedor: Proveedor): void {
        const dialogRef = this.dialog.open(ModalProveedorComponent, {
          width: '80%',
          maxWidth: '400px',
          autoFocus: false,
          data: {
            proveedor: proveedor, // aqui le paso la fila seleccionada al modal
          }
        });
        dialogRef.afterClosed().subscribe(result => {
         this.obtenerProveedores()
        });
      }



}
