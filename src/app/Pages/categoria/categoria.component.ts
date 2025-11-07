import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Catalogos } from 'src/app/Clases/catalogos';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { bo, cA } from '@fullcalendar/core/internal-common';
import { CategoriaProductosService } from 'src/app/services/categoria-productos.service';
import { CategoriaModaComponent } from './categoria-moda/categoria-moda.component';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit{

  categoriaForm: FormGroup;
  displayedColumns: string[] = ['descripcion', 'esActivo', 'acciones'];
  dataSource = new MatTableDataSource<Catalogos>([]);
  filteredDataSource = new MatTableDataSource<Catalogos>([]);


 constructor(
           private categoriaProductosService: CategoriaProductosService,
           private fb: FormBuilder,
           private toastr: ToastrService,
           private dialog: MatDialog,
  ){
    this.categoriaForm = this.fb.group({
      descripcion: ['', Validators.required],
    });
  }



  ngOnInit(): void {
   this.obtenerCategorias()
  }

  obtenerCategorias(): void {
    this.categoriaProductosService.getListCategorias().subscribe(
      (categoria) => {
        this.dataSource.data = categoria;
        this.filteredDataSource.data = categoria; // Inicialmente, la tabla muestra todos los datos
      },
      (error) => {
        console.error('Error al obtener las Categorias de productos', error);
      }
    );
  }


  filtrarCategorias(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDataSource.data = this.dataSource.data.filter(user =>
      user.descripcion?.toLowerCase().includes(filtro)// Búsqueda en descripcion
    );
  }

  agregarCategoria(): void {
    if (this.categoriaForm.valid) {
      const nuevaCategoria: Catalogos = this.categoriaForm.value;
  
      this.categoriaProductosService.Crear(nuevaCategoria).subscribe(
        (response) => {

          if(response.data == true){
              // Si la creación es exitosa, mostrar un mensaje
              this.toastr.success(response.mensaje, 'Éxito');
                      
              this.obtenerCategorias(); 
              this.categoriaForm.reset();
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


    editarCategoria(categoria: Catalogos): void {
      const dialogRef = this.dialog.open(CategoriaModaComponent, {
          width: '80%',
          maxWidth: '400px',
          autoFocus: false,
          data: {
            categoria: categoria, // aqui le paso la fila seleccionada al modal
          }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.obtenerCategorias()
        });
    }

}
