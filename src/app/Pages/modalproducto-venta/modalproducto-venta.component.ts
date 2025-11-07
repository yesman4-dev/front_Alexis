import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductoService } from 'src/app/services/producto.service';
import { Producto } from 'src/app/Clases/producto';
import { MatTableDataSource } from '@angular/material/table';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { OpcionesVenta } from 'src/app/Clases/opciones-venta';
import { UnidadmedidaService } from 'src/app/services/unidadmedida.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { VentaService } from 'src/app/services/venta.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-modalproducto-venta',
  templateUrl: './modalproducto-venta.component.html',
  styleUrls: ['./modalproducto-venta.component.css']
})
export class ModalproductoVentaComponent implements OnInit{
  idRol: number = 0

  opcionesVenta: OpcionesVenta[] = [];
  unidaddeMedidalista: Catalogos[] = [];

opcionSeleccionadaId: number | null = null;


  productoForm: FormGroup;
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  detalleProductos: any[] = [];
  dataSource = new MatTableDataSource<any>();
  columnas: string[] = ['nombreProducto', 'precioVentaUnitario', 'cantidad','subtotal', 'acciones'];
  
  unidadMedidaNombre = ""
  presentacionContenidoNombre = ""
  productoUnidadMedidaId: number = 0;

   ListaLoteDeProducto:any[] = [];

  constructor(
    private fb: FormBuilder,
    private ventaService: VentaService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<ModalproductoVentaComponent>,
    private productoService: ProductoService,
    private unidadmedidaService: UnidadmedidaService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.productoForm = this.fb.group({
      producto: ['', Validators.required],
      precioVenta: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      opcionSeleccionadaId: ['', Validators.required],
      loteProductoId: [null]
    });
  }

  ngOnInit(): void {
            // ID del rol
   this.authService._rolId$.subscribe(rol => {
      this.idRol = rol;
      this.cdRef.detectChanges();
    });

    this.obtenerUnidades();
  
    this.productoService.getListProductos().subscribe(data => {
      this.productos = data;
      this.productosFiltrados = [];
    });
  
    // 👇 Escuchar cambios en la opción seleccionada
    this.productoForm.get('opcionSeleccionadaId')?.valueChanges.subscribe(idOpcionSeleccionada => {
      const opcion = this.opcionesVenta.find(o => o.id === idOpcionSeleccionada);
      if (opcion) {
        this.productoForm.get('precioVenta')?.setValue(opcion.precioVenta);

        this.unidadMedidaNombre = this.getDescripcionUnidad(opcion.unidadMedidaId!);
        this.productoUnidadMedidaId = opcion.id ?? 0;
      }
    });

  }

  filtrarProductos(event: any): void {
    const input = event.target.value.trim().toLowerCase();  // Obtenemos el valor ingresado y lo convertimos a minúsculas para la comparación
    
    if (!input) {
      this.productosFiltrados = [];  // Si no se ha ingresado nada, limpiamos los productos filtrados
    } else {
      this.productosFiltrados = this.productos.filter(producto => 
        producto.nombreProducto.toLowerCase().includes(input) || // Filtrar por nombre de producto
        producto.codigoProducto?.toLowerCase().includes(input) || // O por código del producto
        producto.codigoBarras?.toLowerCase().includes(input) // O por código de barras
      );
    }
  }
  displayProducto(producto: Producto | null): string {
  return producto ? `${producto.nombreProducto} - ${producto.laboratorioNombre} - ${producto.presentacionContenidoNombre}` : '';
  }

    // Función para actualizar el valor de la unidad de medida cuando un radio button es seleccionado
   stockActualProducto: number = 0;

  productoSeleccionado(event: MatAutocompleteSelectedEvent): void {
    const producto: Producto = event.option.value;
    if (!producto) return;

    this.unidadMedidaNombre = producto.unidadMedidaNombre || '';
    this.presentacionContenidoNombre = producto.presentacionContenidoNombre || '';
    this.opcionesVenta = producto.opcionesVenta || [];

    this.productoForm.get('opcionSeleccionadaId')?.reset();
    this.productoForm.get('precioVenta')?.reset();

    this.obtenerLotesPorProducto(producto.id!);
  }

  obtenerLotesPorProducto(productoId: number, bodegaId: number = 1): void {
    this.ventaService.ObtenerLotesDisponiblesPorProducto(productoId, bodegaId).subscribe({
      next: (lotes) => {
        this.ListaLoteDeProducto = lotes;
        // Sumamos el total disponible en todos los lotes
        this.stockActualProducto = lotes.reduce((sum, lote) => sum + lote.stockActual, 0);

        if (this.stockActualProducto > 0) {
          this.toastr.success('Producto disponible para la venta', 'Stock disponible');
        } else {
          this.toastr.warning('No hay stock disponible para vender este producto', 'Sin stock');
        }
      },
      error: (err) => {
        this.toastr.error('Error al obtener lotes del producto', 'Error');
        console.error(err);
      }
    });
  }


  agregarProducto(): void {
   const { producto, precioVenta, cantidad, loteProductoId } = this.productoForm.value;
   
    if (producto && precioVenta && cantidad && this.unidadMedidaNombre) {
      const detalleProducto = {
        productoId: producto.id,
        nombreProducto: this.displayProducto(producto),
        precioVentaUnitario: precioVenta,
        cantidad: cantidad,
        unidadMedidaNombre: this.unidadMedidaNombre, // Aquí se envía el nombre de la unidad de medida seleccionada
        productoUnidadMedidaId: this.productoUnidadMedidaId,
        loteProductoId: loteProductoId ?? null
      };
  
      //console.log("Producto a enviar al padre:", detalleProducto);
  
      this.detalleProductos.push(detalleProducto);
      this.dataSource.data = this.detalleProductos;
  
      // Resetear el formulario y limpiar otras variables
      this.productoForm.reset();
      this.opcionesVenta = []; // Limpiar las opciones de venta
      this.unidadMedidaNombre = ''; // Limpiar la unidad de medida
      this.presentacionContenidoNombre = '';
    }
  }
  

  
  obtenerUnidades(): void {
    this.unidadmedidaService.getListUnidades().subscribe(
      (unidad) => {
        this.unidaddeMedidalista = unidad;
      },
      (error) => {
        // Puedes manejar el error si necesitas, pero por ahora lo dejamos comentado
        // console.error('Error al obtener las Unidades', error);
      }
    );
  }
  // Método para obtener la descripción de la unidad
  getDescripcionUnidad(id: number): string {
    const unidad = this.unidaddeMedidalista.find(u => u.id === id);
    return unidad ? unidad.descripcion : 'Descripción no disponible'; // Retorna la descripción de la unidad
  } 
  

  eliminarProducto(producto: any): void {
    this.detalleProductos = this.detalleProductos.filter(p => p !== producto);
    this.dataSource.data = this.detalleProductos;
  }

  confirmar(): void {
  
    this.dialogRef.close(this.detalleProductos);
  }

  close(){
    this,this.dialogRef.close()
  }

}
