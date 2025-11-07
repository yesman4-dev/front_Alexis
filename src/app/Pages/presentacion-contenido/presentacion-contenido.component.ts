import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Catalogos } from 'src/app/Clases/catalogos';
import { PresentacionProductoService } from 'src/app/services/presentacion-producto.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ModalProveedorComponent } from '../modal-proveedor/modal-proveedor.component';
import { bo } from '@fullcalendar/core/internal-common';
import { ModalPresentacionComponent } from '../modal-presentacion/modal-presentacion.component';


@Component({
  selector: 'app-presentacion-contenido',
  templateUrl: './presentacion-contenido.component.html',
  styleUrls: ['./presentacion-contenido.component.css']
})
export class PresentacionContenidoComponent implements OnInit{

  presentacionForm: FormGroup;
  displayedColumns: string[] = ['descripcion', 'esActivo', 'acciones'];
  dataSource = new MatTableDataSource<Catalogos>([]);
  filteredDataSource = new MatTableDataSource<Catalogos>([]);


  constructor(
          private presentacionProductoService: PresentacionProductoService,
           private fb: FormBuilder,
           private toastr: ToastrService,
           private dialog: MatDialog,
    ){
      this.presentacionForm = this.fb.group({
        descripcion: ['', Validators.required],
      });
  }



  ngOnInit(): void {
    this.obtenerPresentaciones()
   }
 
     obtenerPresentaciones(): void {
       this.presentacionProductoService.getListPContenidos().subscribe(
         (presentacion) => {
           this.dataSource.data = presentacion;
           this.filteredDataSource.data = presentacion; // Inicialmente, la tabla muestra todos los datos
         },
         (error) => {
           console.error('Error al obtener las Presentaciones', error);
         }
       );
     }

     filtrarPresentaciones(event: Event): void {
      const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.filteredDataSource.data = this.dataSource.data.filter(user =>
        user.descripcion?.toLowerCase().includes(filtro)// Búsqueda en descripcion
      );
    }


    agregarPresentacion(): void {
      if (this.presentacionForm.valid) {
        const nuevaBodega: Catalogos = this.presentacionForm.value;
    
        this.presentacionProductoService.Crear(nuevaBodega).subscribe(
          (response) => {
  
            if(response.data == true){
                // Si la creación es exitosa, mostrar un mensaje
                this.toastr.success(response.mensaje, 'Éxito');
                        
                this.obtenerPresentaciones(); 
                this.presentacionForm.reset();
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

  editarPresentacion(presentacion: Catalogos): void {
      const dialogRef = this.dialog.open(ModalPresentacionComponent, {
          width: '80%',
          maxWidth: '400px',
          autoFocus: false,
          data: {
            presentacion: presentacion, // aqui le paso la fila seleccionada al modal
          }
        });
      dialogRef.afterClosed().subscribe(result => {
         this.obtenerPresentaciones()
        });
    }

}
