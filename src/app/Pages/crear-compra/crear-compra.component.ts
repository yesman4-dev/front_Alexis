import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/services/producto.service';
import { Producto } from 'src/app/Clases/producto';
import { CompraService } from 'src/app/services/compra.service';
import { ToastrService } from 'ngx-toastr';
import { Combobox } from 'src/app/modelos/combobox';
import { MatDialog } from '@angular/material/dialog';
import { PresentacionProductoService } from 'src/app/services/presentacion-producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { TipoTransaccionService } from 'src/app/services/tipo-transaccion.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { Proveedor } from 'src/app/Clases/proveedor';
import { ModalproductoCompraComponent } from '../modalproducto-compra/modalproducto-compra.component';
import { LaboratoriosService } from 'src/app/services/laboratorios.service';
import { ModalLoteproductoComponent } from '../modal-loteproducto/modal-loteproducto.component';
import { AuthService } from 'src/app/services/auth.service';
import { ProveedorComponent } from '../proveedor/proveedor.component';

@Component({
  selector: 'app-crear-compra',
  templateUrl: './crear-compra.component.html',
  styleUrls: ['./crear-compra.component.css']
})
export class CrearCompraComponent implements OnInit{


  isLoading = false;

  Tipotransaccionlista: Catalogos [] = []
  ProveedorLista: Proveedor [] = []

  proveedoresFiltrados: Proveedor[] = [];

  columnasTabla: string[] = ['producto', 'presentacionContenidoNombre',  'unidadMedidaNombre', 'precio', 'cantidad', 'lotes', 'acciones'];
  detalleDataSource = new MatTableDataSource<any>([]); // Luego rellenas desde el dialog
  totalCompra = 0;


  compraForm: FormGroup;
  constructor(
      private cdRef: ChangeDetectorRef,
      private authService: AuthService,
      private productoService: ProductoService,
      private presentacionProductoService: PresentacionProductoService,
      private proveedorService: ProveedorService,
      private compraService: CompraService,
      private tipoTransaccionService: TipoTransaccionService,
      private fb: FormBuilder,
      private toastr: ToastrService,
      private dialog: MatDialog,
  ){
    this.compraForm = this.fb.group({
      codigoProducto: [''],
      codigoBarras: [''],
      nombreProducto: [''],
      esFracionable: [false],//un chekbox
      unidadPorEmpaque: [''],
      precioVentaUnidad: [''],
      imagenURL: [''],
      laboratorioId: [''],
      proveedorId: ['', Validators.required],
      tipoTransaccionId: ['', Validators.required],
    
   
     
    });
  }

    

  idUser: number = 0
  ngOnInit(): void {
    
    this.authService.userId$.subscribe(id => {
      this.idUser = id;
      this.cdRef.detectChanges();
    });

   this.obtenerListadeProveedor()
   this.obtenerTipoDeTransacciones()
  }

CrearCompra() {
  if (this.isLoading) return; // ¡Clic repetido bloqueado!

  if (this.compraForm.invalid) {
    this.toastr.warning('Por favor complete los campos obligatorios', 'Formulario incompleto');
    return;
  }

  const detalle = this.detalleDataSource.data;
  const productosSinLotes = detalle.filter(p => !p.lotes || p.lotes.length === 0);
  if (productosSinLotes.length > 0) {
    this.toastr.error('Hay productos sin lotes asignados. Revísalos antes de guardar.', 'Error');
    return;
  }

  const cantidadesDescuadradas = detalle.filter(p => {
    const sumaLotes = p.lotes.reduce((acc: number, lote: any) => acc + lote.cantidad, 0);
    return sumaLotes !== p.cantidad;
  });
  if (cantidadesDescuadradas.length > 0) {
    this.toastr.error('La suma de cantidades en los lotes no coincide con la cantidad del producto.', 'Error');
    return;
  }

  const payload = {
    totalCompra: this.totalCompra,
    usuarioId: this.idUser,
    proveedorId: this.compraForm.value.proveedorId,
    tipoTransaccionId: this.compraForm.value.tipoTransaccionId,
    detalleCompras: detalle.map(p => ({
      productoId: p.productoId,
      precioCompraUnitario: p.precio,
      cantidad: p.cantidad,
      loteProductos: p.lotes.map((l: any) => ({
        fechaVencimiento: l.fechaVencimiento,
        stockActual: l.cantidad,
        bodegaId: l.bodegaId
      }))
    }))
  };

  this.isLoading = true;
  this.compraService.Crear(payload).subscribe(
    (data: BackendMessage) => {
      this.isLoading = false;
      if (data.data) {
        this.toastr.success(data.mensaje, '¡Compra registrada!');
        this.detalleDataSource.data = [];
        this.compraForm.reset();
        this.totalCompra = 0;
      } else {
        this.toastr.info(data.mensaje, 'Validación');
      }
    },
    (error) => {
      this.isLoading = false;
      console.error('Error al registrar la compra', error);
      this.toastr.error('Ocurrió un error al guardar', 'Error');
    }
  );
}


  eliminarFila(elemento: any): void {
    const dataActual = this.detalleDataSource.data;
    const nuevosDatos = dataActual.filter(item => item !== elemento);
    this.detalleDataSource.data = nuevosDatos;
  
    this.calcularTotalCompra(); // Actualiza el total después de eliminar
    this.toastr.info('Producto eliminado del detalle', 'Eliminado');
  }
  
  
  abrirDialogoLotes(producto: any): void {
    const dialogRef = this.dialog.open(ModalLoteproductoComponent, {
      width: '600px',
      data: {
        producto: producto,
        lotes: producto.lotes || []
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Guardamos los lotes en el producto correspondiente
        producto.lotes = result;
  
        // Si quieres recalcular el total de la compra con base en los lotes, puedes hacerlo aquí
        this.calcularTotalCompra();
      }
    });
  }
  

  abrirDialogBuscarProducto(): void {
    const dialogRef = this.dialog.open(ModalproductoCompraComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: true,
    });
  
    dialogRef.afterClosed().subscribe((result: any[]) => {
      if (result && result.length > 0) {
        // Agregar al dataSource
        const dataActual = this.detalleDataSource.data;
        console.log("data recibida", dataActual)
        this.detalleDataSource.data = [...dataActual, ...result];
  
        // Recalcular total
        this.calcularTotalCompra();
      }
    });
  }



  calcularTotalCompra(): void {
    this.totalCompra = this.detalleDataSource.data.reduce((acc, item) => {
      return acc + (item.precio * item.cantidad);
    }, 0);
  }
  



  


  filtrarProveedores(event: any) {
    const input = event.target.value.toLowerCase();
    this.proveedoresFiltrados = this.ProveedorLista.filter(p =>
      p.nombreProveedor.toLowerCase().includes(input)
    );
  }
  
  displayProveedor = (id: number) => {
    const prov = this.ProveedorLista.find(p => p.id === id);
    return prov ? prov.nombreProveedor : '';
  };

  obtenerTipoDeTransacciones(): void {
    this.tipoTransaccionService.getListTipoTransaccion().subscribe(
      (data) => {
        this.Tipotransaccionlista = data;
       // console.log("tipo de transacciones",data)
      },
      (error) => {
        //console.error('Error al obtener las Categorias de productos', error);
      }
    );
  }




  obtenerListadeProveedor(): void {
    this.proveedorService.getListProveedoresActivos().subscribe(
      (data) => {
        this.ProveedorLista = data;
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

  abrirModalProveedor(){
     const dialogRef = this.dialog.open(ProveedorComponent, {
          autoFocus: true,
          });
            dialogRef.afterClosed().subscribe(result => {
              this.obtenerListadeProveedor()
      });
  }



}
