import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Catalogos } from 'src/app/Clases/catalogos';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { bo } from '@fullcalendar/core/internal-common';
import { UnidadModalComponent } from './unidad-modal/unidad-modal.component';
import { UnidadmedidaService } from 'src/app/services/unidadmedida.service';

@Component({
  selector: 'app-unidad',
  templateUrl: './unidad.component.html',
  styleUrls: ['./unidad.component.css']
})
export class UnidadComponent implements OnInit{

  unidadForm: FormGroup;
  displayedColumns: string[] = ['descripcion', 'esActivo', 'acciones'];
  dataSource = new MatTableDataSource<Catalogos>([]);
  filteredDataSource = new MatTableDataSource<Catalogos>([]);

  constructor(
           private unidadmedidaService: UnidadmedidaService,
           private fb: FormBuilder,
           private toastr: ToastrService,
           private dialog: MatDialog,
  ){
    this.unidadForm = this.fb.group({
      descripcion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
   this.obtenerUnidades()
  }

  obtenerUnidades(): void {
    this.unidadmedidaService.getListUnidades().subscribe(
      (unidad) => {
        this.dataSource.data = unidad;
        this.filteredDataSource.data = unidad; // Inicialmente, la tabla muestra todos los datos
      },
      (error) => {
        console.error('Error al obtener las Unidades', error);
      }
    );
  }

  filtrarUnidades(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDataSource.data = this.dataSource.data.filter(user =>
      user.descripcion?.toLowerCase().includes(filtro)// Búsqueda en descripcion
    );
  }

  agregarUnidad(): void {
    if (this.unidadForm.valid) {
      const nuevaUnidad: Catalogos = this.unidadForm.value;
  
      this.unidadmedidaService.Crear(nuevaUnidad).subscribe(
        (response) => {

          if(response.data == true){
              // Si la creación es exitosa, mostrar un mensaje
              this.toastr.success(response.mensaje, 'Éxito');
                      
              this.obtenerUnidades(); 
              this.unidadForm.reset();
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

  editarUnidad(unidad: Catalogos): void {
    const dialogRef = this.dialog.open(UnidadModalComponent, {
        width: '80%',
        maxWidth: '400px',
        autoFocus: false,
        data: {
          unidad: unidad, // aqui le paso la fila seleccionada al modal
        }
      });
      dialogRef.afterClosed().subscribe(result => {
          this.obtenerUnidades()
      });
  }

}
