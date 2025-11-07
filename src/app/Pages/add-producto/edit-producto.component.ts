import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/services/producto.service';
import { Producto } from 'src/app/Clases/producto';
import { OpcionesVenta } from 'src/app/Clases/opciones-venta';
import { ToastrService } from 'ngx-toastr';
import { Combobox } from 'src/app/modelos/combobox';
import { MatDialog } from '@angular/material/dialog';
import { BodegaService } from 'src/app/services/bodega.service';
import { CategoriaProductosService } from 'src/app/services/categoria-productos.service';
import { LaboratoriosService } from 'src/app/services/laboratorios.service';
import { PresentacionProductoService } from 'src/app/services/presentacion-producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { UnidadmedidaService } from 'src/app/services/unidadmedida.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { AuthService } from 'src/app/services/auth.service';
import { CategoriaComponent } from '../categoria/categoria.component';
import { LaboratorioComponent } from '../laboratorio/laboratorio.component';
import { PresentacionContenidoComponent } from '../presentacion-contenido/presentacion-contenido.component';
import { UnidadComponent } from '../unidad/unidad.component';

@Component({
  selector: 'app-edit-producto',
  templateUrl: './edit-producto.component.html',
  styleUrls: ['./edit-producto.component.css']
})
export class EditProductoComponent implements OnInit{

  username: string = '';

  bodegalista: Catalogos [] = []
  categorialista: Catalogos [] = []
  laboratoriolista: Catalogos [] = []
  presentacionlista: Catalogos [] = []
  proveedorlista: Catalogos [] = []
  unidaddeMedidalista: Catalogos [] = []

  categoriasFiltradas: Catalogos[] = [];
  laboratoriosFiltrados: Catalogos[] = [];
  presentacionesFiltradas: Catalogos[] = [];
  unidadesFiltradas: Catalogos[] = [];


  opcionesVenta: OpcionesVenta[] = [];
  productosAgregados: Producto[] = [];

  nuevaOpcion: OpcionesVenta = {
   // id: 0,
    unidadMedidaId: 0,
    cantidadPorUnidad: 0,
    precioVenta: 0
  };

  Archivo: File | null = null;

  productoForm: FormGroup;
  constructor(
        private authService: AuthService,
        private cdRef: ChangeDetectorRef,
        private productoService: ProductoService,
        private bodegaService: BodegaService,
        private categoriaProductosService: CategoriaProductosService,
        private laboratoriosService: LaboratoriosService,
        private presentacionProductoService: PresentacionProductoService,
        private proveedorService: ProveedorService,
        private unidadmedidaService: UnidadmedidaService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private dialog: MatDialog,
  ){
    this.productoForm = this.fb.group({
      codigoProducto: ['', Validators.required],
      nombreProducto: ['', Validators.required],
      descripcionCorta: [''],
      descripcionLarga: [''],
      descuentoPorCantidad: [],
      esFracionable: [false],//un chekbox
      esProductoEspecial: [false], // esto solo lo tiene que poder ver el usuario ID AdminA
      imagenURL: [''],
      codigoBarras: [''],
     // bodegaId: ['', Validators.required],//que se pueda con un autocompletador
      categoriaProductoId: ['', Validators.required],//que se pueda con un autocompletador
      laboratorioId: ['', Validators.required],//que se pueda con un autocompletador
      presentacionContenidoId: ['', Validators.required],//que se pueda con un autocompletador
      unidadMedidaId: ['', Validators.required],//que se pueda con un autocompletador
      precioVenta: [, Validators.required],
     
    });
  }

  ngOnInit(): void {
    this.authService.username$.subscribe(name => {
      this.username = name;
      this.cdRef.detectChanges();
    });


   this.obtenerCategorias()
   this.obtenerLaboratorios()
   this.obtenerPresentaciones()
   this.obtenerUnidades()

   this.filtros()

  }

    obtenerLaboratorios(): void {
    this.laboratoriosService.getListLaboratorios().subscribe(
      (lab) => {
        this.laboratoriolista = lab;
       
      },
      (error) => {
        console.error('Error al obtener los laboratorios de productos', error);
      }
    );
  }

filtros() {
  this.productoForm.get('categoriaProductoId')?.valueChanges.subscribe(value => {
    const filterValue = this.filtrarTexto(value);
    this.categoriasFiltradas = this.categorialista.filter(c => c.descripcion.toLowerCase().includes(filterValue));
  });

  this.productoForm.get('laboratorioId')?.valueChanges.subscribe(value => {
    const filterValue = this.filtrarTexto(value);
    this.laboratoriosFiltrados = this.laboratoriolista.filter(l => l.descripcion.toLowerCase().includes(filterValue));
  });

  this.productoForm.get('presentacionContenidoId')?.valueChanges.subscribe(value => {
    const filterValue = this.filtrarTexto(value);
    this.presentacionesFiltradas = this.presentacionlista.filter(p => p.descripcion.toLowerCase().includes(filterValue));
  });

  this.productoForm.get('unidadMedidaId')?.valueChanges.subscribe(value => {
    const filterValue = this.filtrarTexto(value);
    this.unidadesFiltradas = this.unidaddeMedidalista.filter(u => u.descripcion.toLowerCase().includes(filterValue));
  });
}

filtrarTexto(valor: string | number): string {
  return valor?.toString().toLowerCase() || '';
}


displayCategoria = (id: number): string => {
  const categoria = this.categorialista.find(c => c.id === id);
  return categoria ? categoria.descripcion : '';
};

displayLaboratorio = (id: number): string => {
  const laboratorio = this.laboratoriolista.find(l => l.id === id);
  return laboratorio ? laboratorio.descripcion : '';
};

displayPresentacion = (id: number): string => {
  const presentacion = this.presentacionlista.find(p => p.id === id);
  return presentacion ? presentacion.descripcion : '';
};

displayUnidad = (id: number): string => {
  const unidad = this.unidaddeMedidalista.find(u => u.id === id);
  return unidad ? unidad.descripcion : '';
};


onCategoriaSelected(id: number): void {
  this.productoForm.get('categoriaProductoId')?.setValue(id);
}

onLaboratorioSelected(id: number): void {
  this.productoForm.get('laboratorioId')?.setValue(id);
}

onPresentacionSelected(id: number): void {
  this.productoForm.get('presentacionContenidoId')?.setValue(id);
}

onUnidadSelected(id: number): void {
  this.productoForm.get('unidadMedidaId')?.setValue(id);
}


   
  obtenerPresentaciones(): void {
    this.presentacionProductoService.getListPContenidos().subscribe(
      (presentacion) => {
        this.presentacionlista = presentacion;
      },
      (error) => {
        console.error('Error al obtener las Presentaciones', error);
      }
    );
  }

  obtenerUnidades(): void {
    this.unidadmedidaService.getListUnidades().subscribe(
      (unidad) => {
        this.unidaddeMedidalista = unidad;
       
      },
      (error) => {
        console.error('Error al obtener las Unidades', error);
      }
    );
  }
  getDescripcionUnidad(id: number): string {
    const unidad = this.unidaddeMedidalista.find(u => u.id === id);
    return unidad ? unidad.descripcion : '';
  }



    onNombreProductoBlur(): void {
      const nombreProducto = this.productoForm.get('nombreProducto')?.value;

      // Si el nombre está vacío o contiene solo espacios, no hacer nada
      if (!nombreProducto || nombreProducto.trim().length === 0) return;

      this.productoService.GenerarCodigo(nombreProducto).subscribe({
        next: (response) => {
          // Acceder correctamente al código generado dentro de 'codigo.data'
          if (response?.codigo?.data) {
            this.productoForm.get('codigoProducto')?.setValue(response.codigo.data); // Asignamos el código generado al campo del formulario
          } else {
            console.error('No se pudo generar el código');
          }
        },
        error: (err) => {
          console.error('Error generando código de producto:', err);
        }
      });
    }

    // Método para capturar el archivo seleccionado y asignarlo a la variable correspondiente
    onImageSelect(event: Event, controlName: string): void {
      const input = event.target as HTMLInputElement;

      if (input.files && input.files.length > 0) {
        const selectedFile = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
          this.productoForm.get(controlName)?.setValue(reader.result as string); // Para previsualización
        };

        reader.readAsDataURL(selectedFile);

        // Asigna el archivo a la variable correspondiente
        switch (controlName) {
          case 'imagenURL':
            this.Archivo = selectedFile;
            break;
        }
      }
    }

    
    // Método genérico para subir un archivo y obtener su URL
    private subirArchivoYObtenerUrl(archivo: File | null): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!archivo) {
          resolve('');
          return;
        }
    
        this.productoService.SubirArchivo(archivo).subscribe({
          next: (response: BackendMessage) => {
            const url = response.data?.url 
            if (url) {
              resolve(url);
            } else {
              reject(response.mensaje || 'No se pudo obtener la URL del archivo subido.');
            }
          },
          error: (error: any) => {
            reject(error?.error?.mensaje || 'Error al subir el archivo.');
          },
        });
      });
    }

    obtenerCategorias(): void {
    this.categoriaProductosService.getListCategorias().subscribe(
      (categoria) => {
        this.categorialista = categoria;
      },
      (error) => {
        console.error('Error al obtener las Categorias de productos', error);
      }
    );
  }

    


  async guardarProducto(): Promise<void> {
    if (this.productoForm.invalid) {
      this.toastr.warning('Por favor, completa todos los campos requeridos.');
      return;
    }
  
    const formData = this.productoForm.value;
  
    if (formData.esFracionable && this.opcionesVenta.length === 0) {
      this.toastr.warning('Debe agregar al menos una opción de venta.');
      return;
    }
  
    let nuevaUrl = '';
    try {
      nuevaUrl = this.Archivo
        ? await this.subirArchivoYObtenerUrl(this.Archivo)
        : this.productoForm.value.imagenURL;
    } catch (error) {
      const mensaje = typeof error === 'string'
        ? error
        : (error as any)?.mensaje || error?.toString() || 'Error al subir la imagen';
    
      this.toastr.error(mensaje, 'Error');
      return;
    }
    
    
  
    const producto: Producto = {
      ...formData,
      imagenURL: nuevaUrl,
      opcionesVenta: formData.esFracionable ? this.opcionesVenta : [],
    };
  
    this.productoService.Crear(producto).subscribe({
      next: (response) => {
        if (response.data == true) {
          this.toastr.success(response.mensaje, 'Producto Guardado');
          this.productosAgregados.push(producto);
          this.productoForm.reset();
          this.opcionesVenta = [];
          this.Archivo = null;
        } else {
          this.toastr.info(response.mensaje, 'Error');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al crear el producto');
      }
    });
  }
  
  
  cancelar(){
    this.productoForm.reset();
    this.opcionesVenta = [];
    this.Archivo = null;
  }



  agregarOpcionVenta(): void {
    if (
      this.nuevaOpcion.unidadMedidaId > 0 &&
      this.nuevaOpcion.cantidadPorUnidad > 0 &&
      this.nuevaOpcion.precioVenta > 0
    ) {
      const nueva = { ...this.nuevaOpcion };
      //console.log('Opción de venta agregada:', nueva); // 👈 Aquí el log
  
      this.opcionesVenta.push(nueva);
  
      // renderizado de la tabla si es un array normal
      this.opcionesVenta = [...this.opcionesVenta];
  
      this.nuevaOpcion = {
        unidadMedidaId: 0,
        cantidadPorUnidad: 0,
        precioVenta: 0
      };
    } else {
      this.toastr.warning('Complete correctamente los campos de la opción de venta');
    }
  }
  

  abrirModalCategoria() {
  const dialogRef = this.dialog.open(CategoriaComponent, {
      autoFocus: true,
      });
        dialogRef.afterClosed().subscribe(result => {
          this.obtenerCategorias()
      });
  }
  
  abrirModalLaboratorio() {
    const dialogRef = this.dialog.open(LaboratorioComponent, {
      autoFocus: true,
      });
        dialogRef.afterClosed().subscribe(result => {
          this.obtenerLaboratorios()
      });
  }
  
  abrirModalPresentacion() {
    const dialogRef = this.dialog.open(PresentacionContenidoComponent, {
      autoFocus: true,
      });
        dialogRef.afterClosed().subscribe(result => {
          this.obtenerPresentaciones()
      });
  }
  
  abrirModalUnidadMedida() {
    const dialogRef = this.dialog.open(UnidadComponent, {
      autoFocus: true,
      });
        dialogRef.afterClosed().subscribe(result => {
          this.obtenerUnidades()
      });
  }
  
  
  eliminarOpcionVenta(index: number) {
    this.opcionesVenta.splice(index, 1);
    this.opcionesVenta = [...this.opcionesVenta]; // <-- Esto obliga a Angular a ver que el array cambió
  }
  
  
  
  
  
}
