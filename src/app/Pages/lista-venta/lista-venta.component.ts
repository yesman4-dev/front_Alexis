import { Component, OnInit } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
import { ToastrService } from 'ngx-toastr';
import { Venta } from 'src/app/Clases/venta';
import { ModaldetalleComprasComponent } from '../modaldetalle-compras/modaldetalle-compras.component';
import { MatDialog } from '@angular/material/dialog';
import { ModaldetalleVentasComponent } from '../modaldetalle-ventas/modaldetalle-ventas.component';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { ProductoService } from 'src/app/services/producto.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from '@angular/common';
import { Producto } from 'src/app/Clases/producto';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-lista-venta',
  templateUrl: './lista-venta.component.html',
  styleUrls: ['./lista-venta.component.css']
})
export class ListaVentaComponent implements OnInit, AfterViewInit{
      @ViewChild(MatPaginator) paginator!: MatPaginator;

  ventasPorProducto: any[] = [];
  mostrarResumen = false; // Para mostrar u ocultar el resumen
  fechaInicio!: Date | null;
  fechaFin!: Date | null;

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  filtroTipoTransaccion: string = '';


    listaVentas: Venta [] = [];
    filteredVentas: Venta[] = [];
    displayedColumns: string[] = ['id', 
      'fechaRegistro',
       'totalVenta',
       'cobroPorEnvio',
        'totalGanancia',
         'usuarioNombre',
          'clienteNombre', 
          'tipoTransaccionNombre',
           'acciones'];

           
 dataSource: Venta[] = [];          
  totalRegistros = 0;
  registrosPorPagina = 10;
  paginaActual = 1;
  
  
  constructor(
    private toastr: ToastrService,
    private dialog: MatDialog,
    private ventaService: VentaService,
    private productoService: ProductoService,
  ) {}

   ngAfterViewInit(): void {
      //this.dataSource.paginator = this.paginator;
      this.paginator.page.subscribe(() => {
        this.paginaActual = this.paginator.pageIndex + 1;
        this.registrosPorPagina = this.paginator.pageSize;
        this.obtenerListaVentas();
      });
    }


  ngOnInit(): void {
      this.obtenerListaVentas()

        this.productoService.getListProductos().subscribe(data => {
        this.productos = data;
        this.productosFiltrados = [];
      });
  }

 generarExcel(): void {
  let ventas = [...this.dataSource];

  // Filtrar por tipo de transacción si aplica
  if (this.filtroTipoTransaccion) {
    ventas = ventas.filter(v =>
      v.tipoTransaccionNombre?.toLowerCase() === this.filtroTipoTransaccion.toLowerCase()
    );
  }

  // Estructura de datos para exportar
  const datos = ventas.map(venta => ({
    ID: venta.id || '',
    Fecha: formatDate(venta.fechaRegistro!, 'dd/MM/yyyy', 'en-US'),
    'Total Venta (L.)': venta.totalVenta.toFixed(2),
    'Ganancia (L.)': venta.totalGanancia?.toFixed(2) ?? '0.00',
    Usuario: venta.usuarioNombre || '',
    Cliente: venta.clienteNombre || 'Consumidor Final',
    'Tipo Transacción': venta.tipoTransaccionNombre || ''
  }));

  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro: XLSX.WorkBook = {
    Sheets: { 'Ventas': hoja },
    SheetNames: ['Ventas']
  };

  // Generar y descargar el archivo
  XLSX.writeFile(libro, `Reporte_Ventas_${new Date().getTime()}.xlsx`);
}


  generarPDF(): void {
  let ventas = this.dataSource;

  if (this.filtroTipoTransaccion) {
    ventas = ventas.filter(v =>
      v.tipoTransaccionNombre?.toLowerCase() === this.filtroTipoTransaccion.toLowerCase()
    );
  }

  const fechaActual = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
  const gananciaTotal = ventas.reduce((sum, venta) => sum + (venta.totalGanancia || 0), 0);
  const totalVentas = ventas.reduce((sum, venta) => sum + (venta.totalVenta || 0), 0);

  const encabezadoTabla = [
    { text: 'ID', style: 'tableHeader' },
    { text: 'Fecha', style: 'tableHeader' },
    { text: 'Total Venta', style: 'tableHeader' },
    { text: 'Ganancia', style: 'tableHeader' },
    { text: 'Usuario', style: 'tableHeader' },
    { text: 'Cliente', style: 'tableHeader' },
    { text: 'Tipo', style: 'tableHeader' }
  ];

  const cuerpoTabla = ventas.map(venta => ([
    { text: venta.id?.toString() || '', style: 'tableCell' },
    { text: formatDate(venta.fechaRegistro!, 'dd/MM/yyyy', 'en-US'), style: 'tableCell' },
    { text: `L. ${venta.totalVenta.toFixed(2)}`, style: 'tableCell' },
    { text: `L. ${venta.totalGanancia?.toFixed(2) ?? '0.00'}`, style: 'tableCell' },
    { text: venta.usuarioNombre || '', style: 'tableCell' },
    { text: venta.clienteNombre || 'Consumidor Final', style: 'tableCell' },
    { text: venta.tipoTransaccionNombre || '', style: 'tableCell' }
  ]));

  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Variedades Alexis', style: 'header' },
      { text: `Reporte de Ingresos - ${fechaActual}`, style: 'title' },
      { text: `Tipo: ${this.filtroTipoTransaccion || 'Todos'}`, style: 'subtitle' },
      { text: `Fecha de generación: ${fechaActual}`, style: 'date' },
      '\n',
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', '*', '*', '*'],
          body: [
            encabezadoTabla,
            ...cuerpoTabla
          ]
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? '#4CAF50' : (rowIndex % 2 === 0 ? '#f9f9f9' : null)
        }
      },
      '\n',
      {
        text: `Total de Ventas: L. ${totalVentas.toFixed(2)}`,
        style: 'total',
        alignment: 'right'
      },
      {
        text: `Ganancia Total: L. ${gananciaTotal.toFixed(2)}`,
        style: 'total',
        alignment: 'right'
      }
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        alignment: 'center',
        color: '#2E7D32',
        margin: [0, 0, 0, 5]
      },
      title: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      subtitle: {
        fontSize: 12,
        alignment: 'center',
        margin: [0, 0, 0, 5],
        color: '#555'
      },
      date: {
        fontSize: 10,
        alignment: 'right',
        margin: [0, 0, 0, 10],
        color: '#555'
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#4CAF50',
        alignment: 'center'
      },
      tableCell: {
        fontSize: 10,
        color: '#333'
      },
      total: {
        bold: true,
        fontSize: 12,
        margin: [0, 5, 0, 0],
        color: '#1B5E20'
      }
    }
  };

  pdfMake.createPdf(docDefinition).open();
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
    return producto
      ? `${producto.nombreProducto} - ${producto.laboratorioNombre} - ${producto.presentacionContenidoNombre}`
      : '';
  }

  revertirTipoVenta(venta: Venta) {
        if (!venta || !venta.id) return;
  
        Swal.fire({
          title: '¿Está seguro?',
          text: `¿Desea cambiar esta venta de tipo ${venta.tipoTransaccionNombre}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, cambiar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: 'Procesando...',
              text: 'Por favor espere...',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });
  
            this.ventaService.RevertirTipoVenta(venta.id!).subscribe({
              next: (res) => {
                Swal.fire('¡Éxito!', res.mensaje, 'success');
                this.obtenerListaVentas();
              },
              error: (err) => {
                const msg = err.error?.mensaje || 'No se pudo revertir la venta.';
                Swal.fire('Error', msg, 'error');
              }
            });
          }
        });
      }


  productoSeleccionado!: Producto | null;
 //pata ver las facruras vendidas por el producto que se busco
  onProductoSeleccionado(producto: Producto): void {
    this.productoSeleccionado = producto;

    // Llama al backend para traer las ventas donde se vendió este producto
    this.ventaService.BuscarVentasPorProducto(producto.id!).subscribe({
      next: (ventas) => {
        this.listaVentas = ventas;
        this.filteredVentas = ventas;
        this.dataSource = ventas;
        this.totalRegistros = ventas.length;
        this.paginaActual = 1;
        this.mostrarResumen = true;
        this.paginator.firstPage();
      },
      error: (err) => {
        this.toastr.error('Error al cargar ventas del producto');
      }
    });
  }

  onProductoBlur(): void {
    if (!this.productoSeleccionado) {
      this.productosFiltrados = [];
    }
  }


  //para poder buscar una venta por su, id, cliente y total desde el backend 
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim();

    if (!searchValue) {
      this.obtenerListaVentas();
      return;
    }

    const esNumero = !isNaN(Number(searchValue));
    const numero = Number(searchValue);

    let ventaId: number | undefined = undefined;
    let totalVenta: number | undefined = undefined;
    let clienteNombre: string | undefined = undefined;

    if (esNumero) {
      // Lógica: si el número es entero, lo tratamos como ID. Si tiene decimales, es un total.
      if (Number.isInteger(numero)) {
        ventaId = numero;
      } else {
        totalVenta = numero;
      }
    } else {
      clienteNombre = searchValue;
    }

    this.ventaService.BuscarVentas(ventaId, totalVenta, clienteNombre).subscribe({
      next: (ventas) => {
        this.listaVentas = ventas;
        this.dataSource = ventas;
        this.totalRegistros = ventas.length;
      },
      error: (err) => {
        console.error('Error al buscar ventas desde API', err);
        this.toastr.error('Error al buscar ventas', 'Error');
      }
    });
  }


  obtenerListaVentas(): void {
    this.ventaService.getListVentas(this.paginaActual, this.registrosPorPagina).subscribe(
      (respuesta) => {
        this.listaVentas = respuesta.items;   // Guardar la lista completa
        this.dataSource = [...this.listaVentas]; // Clonar para mostrar (para que Angular detecte cambios)
        this.totalRegistros = respuesta.totalRegistros;
      },
      (error) => {
        this.toastr.error('Error al obtener las ventas');
      }
    );
  }


    //para ver los productos que se vendieron en el rango de fecha 
    obtenerVentasPorUnidad(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.toastr.warning('Selecciona ambas fechas para ver el resumen por unidad');
      return;
    }

    this.ventaService.ObtenerVentasPorUnidad(this.fechaInicio, this.fechaFin).subscribe({
      next: (respuesta: any) => {
        this.ventasPorProducto = respuesta;
        this.mostrarResumen = true;
      },
      error: () => {
        this.toastr.error('Error al obtener ventas por unidad');
      }
    });
  }

  eliminarVenta(ventaId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la venta permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.ventaService.Eliminar(ventaId).subscribe({
          next: (response) => {
            Swal.close();

            if (response.data) {
              this.toastr.success(response.mensaje || 'Venta eliminada correctamente');
              this.obtenerListaVentas(); // Recargar la tabla
            } else {
              this.toastr.warning(response.mensaje || 'No se pudo eliminar la venta');
              Swal.fire('Advertencia', response.mensaje || 'Ocurrió un problema', 'warning');
            }
          },
          error: (error) => {
            Swal.close();

            const backendMsg = error.error as BackendMessage;
            const msg = backendMsg?.mensaje || 'Error al eliminar la venta';
            
            this.toastr.error(msg);
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }


  filtrarVentasPorFecha(fechaInicio: Date, fechaFin: Date): void {
      if (!fechaInicio || !fechaFin) {
        this.toastr.warning('Debe seleccionar ambas fechas para filtrar');
        return;
      }

      this.ventaService.getVentasPorFecha(fechaInicio, fechaFin).subscribe({
        next: (ventas) => {
          this.dataSource = ventas;
          this.totalRegistros = ventas.length;
          this.paginator.firstPage(); // Reset paginador a la primera página
        },
        error: () => {
          this.toastr.error('Error al filtrar ventas por fecha');
        }
      });

        // También traer el resumen por unidad
      this.obtenerVentasPorUnidad();
  }

  
        // Método que manejará la acción del botón
  verDetalleVenta(venta: Venta) {
      this.dialog.open(ModaldetalleVentasComponent, {
         width: '700px',
         data: venta
       });
  }

  generarPDFVentasPorProducto() {
    const productos = this.ventasPorProducto; // <- Aquí usás tus datos reales
    const fechaInicio = this.fechaInicio;
    const fechaFin = this.fechaFin;

    if (!productos || productos.length === 0) {
      alert('No hay datos para generar el PDF.');
      return;
    }

    const formatoFecha = (fecha: Date) =>
      new Intl.DateTimeFormat('es-HN').format(new Date(fecha));

    const body: any[] = [];

    productos.forEach(producto => {
      body.push([
        { text: `Producto: ${producto.nombreProducto}`, colSpan: 2, bold: true, fillColor: '#eeeeee' },
        {}
      ]);

      body.push([
        { text: 'Unidad de Medida', bold: true },
        { text: 'Cantidad Vendida', bold: true }
      ]);

      producto.ventasPorUnidad.forEach((venta: any) => {
        body.push([
          venta.unidadMedida,
          venta.cantidadVendida.toString()
        ]);
      });

      body.push([{ text: ' ', colSpan: 2 }, {}]);
    });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Variedades Alexis', style: 'header', alignment: 'center' },
        { text: 'Unidades vendidas por producto', style: 'subheader', alignment: 'center' },
        {
          text: `Del ${formatoFecha(fechaInicio!)} al ${formatoFecha(fechaFin!)}`,
          style: 'date',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            widths: ['*', '*'],
            body
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, margin: [0, 0, 0, 5] },
        date: { fontSize: 10, italics: true }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }




}
