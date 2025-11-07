import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BodegaService } from 'src/app/services/bodega.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ModalProveedorComponent } from '../modal-proveedor/modal-proveedor.component';
import { bo } from '@fullcalendar/core/internal-common';
import { ModalBodegaComponent } from './modal-bodega/modal-bodega.component';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.css']
})
export class BodegasComponent implements OnInit{

  
  idRol: number = 0
  bodegaForm: FormGroup;
  displayedColumns: string[] = ['descripcion', 'esActivo', 'direccion', 'acciones'];
  dataSource = new MatTableDataSource<Catalogos>([]);
  filteredDataSource = new MatTableDataSource<Catalogos>([]);

  constructor(
          private bodegaService: BodegaService,
           private fb: FormBuilder,
           private toastr: ToastrService,
           private dialog: MatDialog,
           private cdRef: ChangeDetectorRef,
           private authService: AuthService // ✅ inyectado
    ){
      this.bodegaForm = this.fb.group({
        descripcion: ['', Validators.required],
        direccion: ['']
      });
  }


  ngOnInit(): void {
        // ID del rol
    this.authService._rolId$.subscribe(rol => {
      this.idRol = rol;
      this.cdRef.detectChanges();
    });

   this.obtenerBodegas()
  }

  obtenerBodegas(): void {
      this.bodegaService.getListBodegas().subscribe(
        (bodega) => {
          this.dataSource.data = bodega;
          this.filteredDataSource.data = bodega; // Inicialmente, la tabla muestra todos los datos
        },
        (error) => {
          console.error('Error al obtener Bodegas', error);
        }
      );
  }


    filtrarBodegas(event: Event): void {
      const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.filteredDataSource.data = this.dataSource.data.filter(user =>
        user.descripcion?.toLowerCase().includes(filtro)// Búsqueda en descripcion
      );
    }
  


  agregarBodega(): void {
      if (this.bodegaForm.valid) {
        const nuevaBodega: Catalogos = this.bodegaForm.value;
    
        this.bodegaService.Crear(nuevaBodega).subscribe(
          (response) => {
  
            if(response.data == true){
                // Si la creación es exitosa, mostrar un mensaje
                this.toastr.success(response.mensaje, 'Éxito');
                        
                this.obtenerBodegas(); 
                this.bodegaForm.reset();
            }else{
              this.toastr.info(response.mensaje, 'Éxito');
            }
          
          },
          (error) => {   
            this.toastr.error('Error al crear el registro', 'Error');
            //console.error('Error al crear usuario', error);
          }
        );
      } else {
        this.toastr.warning('Por favor, completa todos los campos correctamente', 'Formulario inválido');
      }
    }

    editarproveedor(bodega: Catalogos): void {
      const dialogRef = this.dialog.open(ModalBodegaComponent, {
          width: '80%',
          maxWidth: '400px',
          autoFocus: false,
          data: {
            bodega: bodega, // aqui le paso la fila seleccionada al modal
          }
        });
      dialogRef.afterClosed().subscribe(result => {
         this.obtenerBodegas()
        });
    }
}
