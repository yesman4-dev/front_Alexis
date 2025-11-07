import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Catalogos } from 'src/app/Clases/catalogos';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { bo, cA } from '@fullcalendar/core/internal-common';
import { LaboratoriosService } from 'src/app/services/laboratorios.service';
import { ModalProveedorComponent } from '../modal-proveedor/modal-proveedor.component';
import { LaboratorioModalComponent } from './laboratorio-modal/laboratorio-modal.component';

@Component({
  selector: 'app-laboratorio',
  templateUrl: './laboratorio.component.html',
  styleUrls: ['./laboratorio.component.css']
})
export class LaboratorioComponent implements OnInit{


  laboratorioForm: FormGroup;
  displayedColumns: string[] = ['descripcion', 'esActivo', 'acciones'];
  dataSource = new MatTableDataSource<Catalogos>([]);
  filteredDataSource = new MatTableDataSource<Catalogos>([]);


 constructor(
           private laboratoriosService: LaboratoriosService,
           private fb: FormBuilder,
           private toastr: ToastrService,
           private dialog: MatDialog,
  ){
    this.laboratorioForm = this.fb.group({
      descripcion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerLaboratorios()
  }

  obtenerLaboratorios(): void {
    this.laboratoriosService.getListLaboratorios().subscribe(
      (lab) => {
        this.dataSource.data = lab;
        this.filteredDataSource.data = lab; // Inicialmente, la tabla muestra todos los datos
      },
      (error) => {
        console.error('Error al obtener los laboratorios de productos', error);
      }
    );
  }

  filtrarLaboratorios(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDataSource.data = this.dataSource.data.filter(user =>
      user.descripcion?.toLowerCase().includes(filtro)// Búsqueda en descripcion
    );
  }

  agregarLaboratorio(): void {
    if (this.laboratorioForm.valid) {
      const nuevoLab: Catalogos = this.laboratorioForm.value;
  
      this.laboratoriosService.Crear(nuevoLab).subscribe(
        (response) => {

          if(response.data == true){
              // Si la creación es exitosa, mostrar un mensaje
              this.toastr.success(response.mensaje, 'Éxito');
                      
              this.obtenerLaboratorios(); 
              this.laboratorioForm.reset();
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

 editarLaboratorios(laboratorio: Catalogos): void {
      const dialogRef = this.dialog.open(LaboratorioModalComponent, {
          width: '80%',
          maxWidth: '400px',
          autoFocus: false,
          data: {
            laboratorio: laboratorio, // aqui le paso la fila seleccionada al modal
          }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.obtenerLaboratorios()
        });
    }

}
