import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/services/producto.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ClienteService } from 'src/app/services/cliente.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { AuthService } from 'src/app/services/auth.service';
import { VentaService } from 'src/app/services/venta.service';
import { Venta } from 'src/app/Clases/venta';
import { Cliente } from 'src/app/Clases/cliente';
import { TipoTransaccionService } from 'src/app/services/tipo-transaccion.service';
import { ModalproductoVentaComponent } from '../modalproducto-venta/modalproducto-venta.component';
import { DetalleVenta } from 'src/app/Clases/detalle-venta';
import { ReportesService } from 'src/app/services/reportes.service';

import { TDocumentDefinitions } from 'pdfmake/interfaces';
import Swal from 'sweetalert2';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.vfs;

import { ClienteComponent } from '../cliente/cliente.component';

import { VentaTempService } from 'src/app/services/venta-temp.service';



@Component({
  selector: 'app-add-venta',
  templateUrl: './add-venta.component.html',
  styleUrls: ['./add-venta.component.css']
})
export class AddVentaComponent implements OnInit{

  filtroDetalle = ''; // para enlazar con el input
  isSaving = false;


    Tipotransaccionlista: Catalogos [] = []
    ClienteLista: Cliente [] = []
    ClienteFiltrados: Cliente[] = [];
  
    columnasTabla: string[] = ['producto', 'unidadMedidaNombre', 'precio', 'cantidad','subtotal', 'acciones'];
    detalleDataSource = new MatTableDataSource<any>([]); // Luego rellenas desde el dialog
    totalCompra = 0;

  ventaForm: FormGroup;
  constructor(
      private cdRef: ChangeDetectorRef,
      private authService: AuthService,
      private productoService: ProductoService,
      private clienteService: ClienteService,
      private ventaService: VentaService,
      private tipoTransaccionService: TipoTransaccionService,
      private fb: FormBuilder,
      private toastr: ToastrService,
      private dialog: MatDialog,
      private reportesService: ReportesService,
      private ventaTempService: VentaTempService
  ){
    this.ventaForm = this.fb.group({
      clienteId: ['', Validators.required],//tiene que ser un autocompletador
      tipoTransaccionId: ['', Validators.required],//combobox
     
    });
  }

  idUser: number = 0

  ngOnInit(): void {
        this.authService.userId$.subscribe(id => {
          this.idUser = id;
          this.cdRef.detectChanges();
        });

        this.obtenerListadeCLientes();
        this.obtenerTipoDeTransacciones();

        // Cargar datos previos
        const formularioGuardado = this.ventaTempService.cargarFormulario();
        if (formularioGuardado) {
          this.ventaForm.patchValue(formularioGuardado);
        }

        const detallesGuardados = this.ventaTempService.cargarDetalles();
        if (detallesGuardados.length > 0) {
          this.detalleDataSource.data = detallesGuardados;
          this.calcularTotalCompra();
        }

        // Escuchar cambios en el formulario
        this.ventaForm.valueChanges.subscribe(value => {
          this.ventaTempService.guardarFormulario(value);
        });

        // Escuchar cambios en los detalles de productos
        this.detalleDataSource.data = this.detalleDataSource.data || [];
        this.detalleDataSource.data.forEach(item => {
          item.precioVentaUnitario = item.precioVentaUnitario || 0;
          item.cantidad = item.cantidad || 0;
        });

        this.detalleDataSource.filterPredicate = (data, filter) => {
        return data.nombreProducto?.toLowerCase().includes(filter);
      };

            // Escuchar cambios en el cliente
      this.ventaForm.get('clienteId')?.valueChanges.subscribe(clienteId => {
        if (!clienteId) return;

        // Solo si hay productos en el detalle
        if (this.detalleDataSource.data.length === 0) return;

        // Actualizar precios de cada producto según historial
        this.actualizarPreciosSegunCliente(clienteId);
      });
  
  }

private async actualizarPreciosSegunCliente(clienteId: number): Promise<void> {
  const detalles = this.detalleDataSource.data;

  // Creamos un arreglo de promesas para actualizar cada item
  const actualizaciones = detalles.map(async (item) => {
    if (!item.productoId) return;

    try {
      const historial: any[] = (await this.ventaService
      .ObtenerHistorialPreciosClienteProducto(clienteId, item.productoId)
      .toPromise()) || [];


      if (historial && historial.length > 0) {
        const ultimo = historial[0]; // último precio de venta
        item.precioVentaUnitario = ultimo.precioUnitario;
        item.subtotal = +(item.precioVentaUnitario * item.cantidad).toFixed(2);
      }
    } catch (error) {
      console.error(`Error al obtener historial para producto ${item.productoId}:`, error);
    }
  });

  // Esperamos que todas las promesas terminen antes de actualizar la tabla
  await Promise.all(actualizaciones);

  this.detalleDataSource._updateChangeSubscription();
  this.calcularTotalCompra();
}


    filtrarClientes(event: any) {
    const input = event.target.value?.toLowerCase() || '';

    if (input.trim() === '') {
      this.ClienteFiltrados = []; // 🔥 No mostramos ningún cliente
      // No borrar clienteId si ya hay un cliente seleccionado
      return;
    }

    this.ClienteFiltrados = this.ClienteLista.filter(p =>
      p.nombreCliente!.toLowerCase().includes(input)
    );
  }

  
  displayCLiente = (id: number) => {
    const cliente = this.ClienteLista.find(p => p.id === id);
    return cliente ? `${cliente.nombreCliente} - ${cliente.telefono}` : '';
  };


  obtenerListadeCLientes(): void {
      this.clienteService.getListClienteActivos().subscribe(
        (data) => {
          this.ClienteLista = data;
        },
        (error) => {
        
        }
      );
  }

    abrirDialogBuscarProducto(): void {
    const dialogRef = this.dialog.open(ModalproductoVentaComponent, {
      disableClose: true,
      autoFocus: true,
    });
  
      dialogRef.afterClosed().subscribe((result: any[]) => {
        if (result && result.length > 0) {
          // Calcular subtotal en cada item recibido
          const nuevosItems = result.map(item => ({
            ...item,
            subtotal: +(item.precioVentaUnitario * item.cantidad).toFixed(2)
          }));

          const dataActual = this.detalleDataSource.data;
          this.detalleDataSource.data = [...dataActual, ...nuevosItems];

          this.calcularTotalCompra();
        }
      });

  }


  CrearVenta() {
    if (this.ventaForm.invalid || this.detalleDataSource.data.length === 0 || this.isSaving) {
      return;
    }

    this.isSaving = true; // Activamos la bandera

    const formValue = this.ventaForm.value;

    const venta = new Venta();
    venta.clienteId = formValue.clienteId;
    venta.tipoTransaccionId = formValue.tipoTransaccionId;
    venta.usuarioId = this.idUser;
    venta.totalVenta = this.totalCompra;

    venta.detalleVentas = this.detalleDataSource.data.map(item => {
      const detalle = new DetalleVenta();
      detalle.productoId = item.productoId;
      detalle.cantidad = item.cantidad;
      detalle.precioVentaUnitario = item.precioVentaUnitario;
      detalle.productoUnidadMedidaId = item.productoUnidadMedidaId;
      detalle.loteProductoId = item.loteProductoId;
      return detalle;
    });

    this.ventaService.Crear(venta).subscribe({
      next: (respuesta: BackendMessage) => {
        this.isSaving = false;

        if (respuesta.data) {
          const ventaId = respuesta.data;
          this.toastr.success(respuesta.mensaje, 'Venta registrada');
          this.ventaForm.reset();
          this.detalleDataSource.data = [];
          this.totalCompra = 0;
          this.ventaTempService.limpiarDatos();

          Swal.fire({
            title: '¿Desea generar el recibo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'No',
          }).then(result => {
            if (result.isConfirmed) {
              this.descargarPDF(ventaId);
            }
          });

        } else {
          this.toastr.error(respuesta.mensaje, 'Error al registrar venta');
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.toastr.error('Ocurrió un error al registrar la venta', 'Error');
        console.error(err);
      }
    });
  }


  generarCotizacionDesdeFormulario(): void {
    const clienteNombre = this.ClienteFiltrados.find(c => c.id === this.ventaForm.value.clienteId)?.nombreCliente || 'No especificado';
    const tipoTransaccion = this.Tipotransaccionlista.find(t => t.id === this.ventaForm.value.tipoTransaccionId)?.descripcion || '---';

    const detalles = this.detalleDataSource.data.map((item, index) => ([
      index + 1,
      item.nombreProducto,
      item.unidadMedidaNombre,
      item.cantidad,
      `L. ${item.precioVentaUnitario.toFixed(2)}`,
      `L. ${(item.cantidad * item.precioVentaUnitario).toFixed(2)}`
    ]));

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Variedades Alexis', style: 'tituloNegocio' },
        { text: 'Siempre con los mejores precios', style: 'eslogan' },
        { text: 'Tel: 8832-0883', style: 'telefono' },
        { canvas: [ { type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 } ], margin: [0, 10, 0, 10] },
        
        { text: 'COTIZACIÓN DE VENTA', style: 'header' },
        { text: `Fecha: ${new Date().toLocaleString()}`, alignment: 'right' },
        { text: `Cliente: ${clienteNombre}`, margin: [0, 10, 0, 0] },
        { text: `Tipo de Transacción: ${tipoTransaccion}`, margin: [0, 0, 0, 10] },
        {
          table: {
            widths: [30, '*', '*', 50, 70, 70],
            body: [
              ['#', 'Producto', 'Unidad', 'Cant.', 'P. Unitario', 'Subtotal'],
              ...detalles
            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          text: `\nTotal: L. ${this.totalCompra.toFixed(2)}`,
          style: 'total',
          alignment: 'right',
          margin: [0, 10, 0, 0]
        },
        {
          text: '\nEsta es una cotización no válida como factura. Sujeto a disponibilidad de productos.',
          italics: true,
          fontSize: 10,
          alignment: 'center',
          margin: [0, 30, 0, 0]
        }
      ],
      styles: {
        tituloNegocio: {
          fontSize: 18,
          bold: true,
          alignment: 'center'
        },
        eslogan: {
          fontSize: 12,
          italics: true,
          alignment: 'center',
          margin: [0, 2, 0, 0]
        },
        telefono: {
          fontSize: 11,
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 15]
        },
        total: {
          fontSize: 14,
          bold: true
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }


  // Método para guardar datos temporalmente en el servicio
    guardarTemporal(data: any): void {
      this.ventaTempService.guardarFormulario(data);  // Llama al servicio para guardar los datos en localStorage
    }

    aplicarFiltroDetalle() {
    this.detalleDataSource.filter = this.filtroDetalle.trim().toLowerCase();
    }

    limpiarFiltroDetalle() {
      this.filtroDetalle = '';
      this.aplicarFiltroDetalle();
    }

    guardarDetalles() {
    this.ventaTempService.guardarDetalles(this.detalleDataSource.data);
  }

    actualizarPrecioDesdeSubtotal(index: number): void {
      const item = this.detalleDataSource.data[index];
      item.editandoSubtotal = true; // flag para evitar sobreescribirlo

      const cantidad = Number(item.cantidad) || 0;
      const subtotal = Number(item.subtotal) || 0;

      if (cantidad > 0) {
        item.precioVentaUnitario = +(subtotal / cantidad).toFixed(2);
      } else {
        item.precioVentaUnitario = 0;
      }

      this.calcularTotalCompra();
      
      // quitar el flag con un delay pequeño (cuando termina de escribir)
      setTimeout(() => {
        item.editandoSubtotal = false;
      }, 500);
    }


  calcularTotalCompra(): void {
    this.totalCompra = this.detalleDataSource.data.reduce((acc, item) => {
      const precio = Number(item.precioVentaUnitario) || 0;
      const cantidad = Number(item.cantidad) || 0;

      // Solo actualizar subtotal si no está editando
      if (!item.editandoSubtotal) {
        item.subtotal = +(precio * cantidad).toFixed(2);
      }

      return acc + (Number(item.subtotal) || 0);
    }, 0);

    this.guardarDetalles();
  }


 


  


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

  
  limpiarformulario(){
    this.ventaForm.reset();
    this.detalleDataSource.data = [];
    this.totalCompra = 0;
    this.ventaTempService.limpiarDatos();
  }



  abrirModalCrearCliente() {
    const dialogRef = this.dialog.open(ClienteComponent, {
      autoFocus: true,
      });
        dialogRef.afterClosed().subscribe(result => {
          this.obtenerListadeCLientes()
      });
  }
  

  
  descargarPDF(ventaId: number) {
    this.reportesService.obtenerTicketVentaPDF(ventaId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank'); // ← ¡Esto lo abre en nueva pestaña!
      window.URL.revokeObjectURL(url); // Opcional, pero si lo haces aquí puede cerrarse antes de tiempo
    }, error => {
      //console.error('Error al abrir el PDF', error);
    });
  }
    

}
