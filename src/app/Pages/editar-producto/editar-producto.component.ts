import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/services/producto.service';
import { Producto } from 'src/app/Clases/producto';
import { OpcionesVenta } from 'src/app/Clases/opciones-venta';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { BodegaService } from 'src/app/services/bodega.service';
import { CategoriaProductosService } from 'src/app/services/categoria-productos.service';
import { LaboratoriosService } from 'src/app/services/laboratorios.service';
import { PresentacionProductoService } from 'src/app/services/presentacion-producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { UnidadmedidaService } from 'src/app/services/unidadmedida.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { of, merge } from 'rxjs';
import { debounceTime, switchMap, filter, startWith } from 'rxjs/operators';
import { Url } from 'src/app/modelos/url';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service'
import { ModalInventarioComponent } from '../modal-inventario/modal-inventario.component';

@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent implements OnInit{

  idRol: number = 0
  
  displayedColumns: string[] = ['codigoProducto', 'nombreProducto', 'laboratorioId', 'precioCompra', 'precioVenta','stockActual','esFracionable', 'acciones'];
  dataSource = new MatTableDataSource<Producto>([]);
  filteredDataSource = new MatTableDataSource<Producto>([]);

  bodegalista: Catalogos [] = []
  categorialista: Catalogos [] = []
  laboratoriolista: Catalogos [] = []
  presentacionlista: Catalogos [] = []
  proveedorlista: Catalogos [] = []
  unidaddeMedidalista: Catalogos [] = []

 // Controlador del formulario para el filtro de búsqueda
 filtroControl = new FormControl();
  
 // Lista de productos filtrados
 productosFiltrados: Producto[] = [];

 productoSeleccionadoId: number | null = null;

  opcionesVenta: OpcionesVenta[] = [];
  productosAgregados: Producto[] = [];
  username: string = '';

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
      descuentoPorCantidad: [''],
      esFracionable: [''],
      esActivo: [false],
      esProductoEspecial: [false],
      stockActual: [{ value: '', disabled: true }],
      imagenURL: [''],
      codigoBarras: [''],
      categoriaProductoId: ['', Validators.required],
      laboratorioId: ['', Validators.required],
      presentacionContenidoId: ['', Validators.required],
      unidadMedidaId: ['', Validators.required],
      precioVenta: ['', Validators.required],
      precioCompra: ['']
     
    });
  }

  ngOnInit(): void {
    
      //para sacar el nombre de usuario del token
      this.authService.username$.subscribe(name => {
        this.username = name;
        this.cdRef.detectChanges();
      });

      // ID del rol
      this.authService._rolId$.subscribe(rol => {
        this.idRol = rol;
    
        if (rol === 2) {
          this.displayedColumns = [
            'codigoProducto',
            'nombreProducto',
            'laboratorioId',
            'precioVenta',
            'stockActual',
            'esFracionable'
          ];
        } else {
          this.displayedColumns = [
            'codigoProducto',
            'nombreProducto',
            'laboratorioId',
            'precioCompra',
            'precioVenta',
            'stockActual',
            'esFracionable',
            'acciones'
          ];
        }
    
        this.cdRef.detectChanges();
      });

      merge(
        this.productoForm.get('codigoProducto')!.valueChanges,
      )
      .pipe(
        debounceTime(300),
        startWith(''),
        switchMap(valor => {
          const filtro = (valor || '').trim();
          if (filtro === '') {
            // Si está vacío, limpia resultados y retorna observable vacío
            this.productosFiltrados = [];
            return []; // no se hace llamada al backend
          }
          return this.productoService.buscarProductos(filtro);
        })
      )
      .subscribe(productos => {
        this.productosFiltrados = productos;
      });
        
      this.obtenerBodegas()
      this.obtenerCategorias()
      this.obtenerLaboratorios()
      this.obtenerPresentaciones()
      this.obtenerUnidades()
      //this.obtenerProductos()
   }


   //papara poder continuar agregando unidades de medida al proucto ya creado
    agregarUnidadDeMedidaAProducto(): void {
      if (
        this.nuevaOpcion.unidadMedidaId > 0 &&
        this.nuevaOpcion.cantidadPorUnidad > 0 &&
        this.nuevaOpcion.precioVenta > 0 &&
        this.productoSeleccionadoId
      ) {
        const dto = {
          unidadMedidaId: this.nuevaOpcion.unidadMedidaId,
          cantidadPorUnidad: this.nuevaOpcion.cantidadPorUnidad,
          precioVenta: this.nuevaOpcion.precioVenta
        };

        // Llamar al servicio para agregar la unidad de medida al producto
        this.productoService.AgregarUnidadMedidaAProducto(this.productoSeleccionadoId, dto).subscribe({
          next: (respuesta) => {

            if(respuesta.data){
                this.toastr.success(respuesta.mensaje, "Exito");
            // Actualizar la lista de opciones de venta
                this.opcionesVenta.push(respuesta.data); // Si el backend devuelve la nueva opción de venta
                this.opcionesVenta = [...this.opcionesVenta]; // Forzamos la actualización
                // Limpiar el formulario para la siguiente opción
                this.nuevaOpcion = {
                  unidadMedidaId: 0,
                  cantidadPorUnidad: 0,
                  precioVenta: 0
                };
            }else{
              this.toastr.info(respuesta.mensaje, "Validar");
            }
        
          },
          error: () => {
            this.toastr.error('Error al agregar la unidad de medida');
          }
        });
      } else {
        this.toastr.warning('Complete correctamente los campos de la unidad de medida');
      }
    }



     // Método para manejar la selección de un producto y llenar el formulario con el producto seleccionado
     seleccionarProducto(event: any): void {
      const codigoProducto = event.option.value;
      const productoSeleccionado = this.productosFiltrados.find(p => p.codigoProducto === codigoProducto);
    
      if (!productoSeleccionado) return;
    
      // Procesar URL solo si es relativa
        let imagenUrl = productoSeleccionado.imagenURL || '';
        if (!imagenUrl.startsWith('http')) {
          imagenUrl = `${Url.url}/${imagenUrl}`;
        }

      // Rellenar el formulario con los valores del producto
      this.productoForm.patchValue({
        codigoProducto: productoSeleccionado.codigoProducto,
        nombreProducto: productoSeleccionado.nombreProducto,
        descripcionCorta: productoSeleccionado.descripcionCorta,
        descripcionLarga: productoSeleccionado.descripcionLarga,
        descuentoPorCantidad: productoSeleccionado.descuentoPorCantidad,
        esFracionable: productoSeleccionado.esFracionable,
        esActivo: productoSeleccionado.esActivo,
        stockActual: productoSeleccionado.stockActual,
        imagenURL: imagenUrl, // ✅ corregida
        codigoBarras: productoSeleccionado.codigoBarras,
        categoriaProductoId: productoSeleccionado.categoriaProductoId,
        laboratorioId: productoSeleccionado.laboratorioId,
        presentacionContenidoId: productoSeleccionado.presentacionContenidoId,
        unidadMedidaId: productoSeleccionado.unidadMedidaId,
        precioVenta: productoSeleccionado.precioVenta,
        precioCompra: productoSeleccionado.precioCompra,
        esProductoEspecial: productoSeleccionado.esProductoEspecial,
        
      
      });
      this.opcionesVenta = productoSeleccionado.opcionesVenta || [];
      this.productoSeleccionadoId = productoSeleccionado.id!;


    }

    
    async modificarProducto(): Promise<void> {
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
    
      // ✅ Asegurarse de guardar solo la ruta relativa
      if (nuevaUrl.startsWith(Url.url)) {
        nuevaUrl = nuevaUrl.replace(`${Url.url}/`, '');
      }
    
      const producto: Producto = {
        ...formData,
        imagenURL: nuevaUrl,
      };
    
      this.productoService.ModificarProducto(this.productoSeleccionadoId!, producto).subscribe({
        next: (response) => {
          if (response.data) {
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

    
onEnterKeyPress(event: Event, o: any): void {
  const keyboardEvent = event as KeyboardEvent; // Realizamos un cast explícito
  keyboardEvent.stopPropagation();  // Detener la propagación del evento

  const idUnidadMedida = o.id;  // ID de la unidad de medida seleccionada
  const nuevoPrecioVenta = o.precioVenta;   // El nuevo precio que el usuario ha ingresado

  if (idUnidadMedida && nuevoPrecioVenta > 0) {
    // Llama al servicio solo si el precio es válido
    this.productoService.EditarPrecioUnidadMedida(idUnidadMedida, nuevoPrecioVenta).subscribe({
      next: (response) => {
        this.toastr.success(response.mensaje, 'Precio actualizado');
      },
      error: (error) => {
        this.toastr.error('Error al actualizar el precio');
      }
    });
  } else {
    this.toastr.warning('Por favor, ingrese un precio válido');
  }
}


  
    //para deshabilitar o habilitar un producto
  onDisponibleChange(event: any): void {
      const esActivo = event.checked; // Valor actual del toggle (true o false)
  
      // Mostrar la alerta de confirmación
      Swal.fire({
        title: '¿Estás seguro?',
        text: esActivo ? '¿Quieres habilitar el registro?' : '¿Quieres deshabilitar el registro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, aplicar cambios',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, llama al servicio para actualizar el estado en el backend
          this.productoService.cambiarEstadoProducto( this.productoSeleccionadoId!, esActivo).subscribe({
            next: (respuesta: any) => {
  
              if (respuesta.data == true) {
                this.toastr.success(respuesta.mensaje, 'Actualización Exitosa');
              } else {
                this.toastr.info(respuesta.mensaje, 'Atención');
              }
            },
            error: (error) => {
              this.toastr.error('No se pudo actualizar el estado.', 'Error');
             // console.error('Error al cambiar estado:', error);
  
              // Revertir el cambio en el toggle si hubo un error
              this.productoForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
            },
          });
        } else {
          // Si el usuario cancela, revertir el cambio en el toggle
          this.productoForm.get('esActivo')?.setValue(!esActivo, { emitEvent: false });
        }
      });
    }

    // Método único de búsqueda que filtra por cualquier campo
    buscarProductos(filtro: string): void {
      if (filtro.trim() === '') {
        this.productosFiltrados = [];
        return;
      }

      this.productoService.buscarProductos(filtro).subscribe(productos => {
        // Filtra productos por código, nombre, o código de barras
        this.productosFiltrados = productos.filter(p => 
          p.codigoProducto.toLowerCase().includes(filtro.toLowerCase()) ||
          p.nombreProducto.toLowerCase().includes(filtro.toLowerCase()) ||
          p.codigoBarras!.toLowerCase().includes(filtro.toLowerCase())
        );
      });
    }

    obtenerProductos(): void {
      this.productoService.getListProductos().subscribe(
        (producto) => {
          this.dataSource.data = producto;
          this.filteredDataSource.data = producto; // Inicialmente, la tabla muestra todos los datos
        },
        (error) => {
          console.error('Error al obtener los Productos', error);
        }
      );
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
   
   cancelar(){
     this.productoForm.reset();
     this.opcionesVenta = [];
     this.Archivo = null;
   }
 
 
   obtenerBodegas(): void {
    this.bodegaService.getListBodegas().subscribe(
      (bodega) => {
        this.bodegalista = bodega;
      },
      (error) => {
        console.error('Error al obtener Bodegas', error);
      }
    );
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

   getNombreLaboratorio(id: number): string {
    const lab = this.laboratoriolista.find(l => l.id === id);
    return lab ? lab.descripcion : '—';
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
   
   filtrarProducto(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
  
    if (inputElement) {
      const filtro = inputElement.value.trim().toLowerCase();
  
      // Si el filtro está vacío vuelvo a cargar todos los productos
      if (filtro === '') {
      // this.obtenerProductos()
      } else {
        // Si hay un filtro, realizo la búsqueda
        this.productoService.buscarProductos(filtro).subscribe(
          productos => {
            this.filteredDataSource.data = productos;
          },
          error => {
            this.toastr.warning('No se pudo hacer la busqueda');
          }
        );
      }
    }
  }
  
  //para agregar inventario a un producto sin tener que pasar por el proceso de compras
  abrirModalInventario(producto: Producto) {
    const dialogRef = this.dialog.open(ModalInventarioComponent, {
      width: '600px',
      data: {
        nombreproducto: producto.nombreProducto,
        productoId: producto.id,
        precioCompraUnitario: producto.precioCompra,
        unidadMedidaNombre: producto.unidadMedidaNombre
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // Aquí puedes manejar la respuesta o refrescar productos si es necesario
       // this.obtenerProductos(); // refrescar stock o tabla si aplica
      }
    });
  }

  
  

}
