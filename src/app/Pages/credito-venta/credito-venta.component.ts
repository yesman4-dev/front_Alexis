import { Component, OnInit } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from '@angular/common';
import { PefilEmpresaService } from 'src/app/services/pefil-empresa.service';
import { ModaldetalleCreditoventaComponent } from '../modaldetalle-creditoventa/modaldetalle-creditoventa.component';
import { ModalpagocreditoVentaComponent } from '../modalpagocredito-venta/modalpagocredito-venta.component';
import { ModaldetalleVentasComponent } from '../modaldetalle-ventas/modaldetalle-ventas.component';
import { AudotoriaService } from 'src/app/services/audotoria.service';


@Component({
  selector: 'app-credito-venta',
  templateUrl: './credito-venta.component.html',
  styleUrls: ['./credito-venta.component.css']
})
export class CreditoVentaComponent implements OnInit{

  listacredito: any [] = [];
   clienteId!: number;
  filteredCredito: any[] = [];
  displayedColumns: string[] = ['id','ventaId', 'fechaInicio', 'estadoCredito', 'clienteNombre',  'totalCredito', 'saldoPendiente', 'acciones'];
  
  listaEmpresa: any[] = [];
  


  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private audotoriaService: AudotoriaService,
    private ventaService: VentaService,
    private pefilEmpresaService: PefilEmpresaService
  ) {
    //(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }


  ngOnInit(): void {
    // 🔧 Capturamos el ID de la URL
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));

    this.obenerCreditoDeCliente()
    this.obtenerDatosDeLaEmpresa();
  }

  onEstadoChange(estadoSeleccionado: string): void {
  if (estadoSeleccionado) {
    this.filteredCredito = this.listacredito.filter(c => c.estadoCredito === estadoSeleccionado);
  } else {
    this.filteredCredito = [...this.listacredito]; // Mostrar todos si se selecciona "Todos"
  }
}


  obenerCreditoDeCliente(){
    if (this.clienteId) {
        this.audotoriaService.getCreditosPorCliente(this.clienteId).subscribe({
          next: (data) => {
            this.listacredito = data;
            this.filteredCredito = [...data]; // Mostrar todos al principio
          },
          error: (err) => {
            console.error('Error al cargar créditos del cliente', err);
          }
        });
    }
  }



  abrirModalDetalleVenta(ventaId: number): void {
    this.dialog.open(ModaldetalleVentasComponent, {
      width: '700px',
      data: ventaId
    });
  }

           // Método que manejará la acción del botón
  verDetalleVentaCredito(ceditoVenta: any) {
    this.dialog.open(ModaldetalleCreditoventaComponent, {
      width: '700px',
      data: ceditoVenta
    });
  }

              // Método que manejará la acción del botón
  abrirModalAbonar(ceditoVenta: any) {
    const dialogRef = this.dialog.open(ModalpagocreditoVentaComponent, {
      width: '400px',
      data: ceditoVenta,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
       this.obenerCreditoDeCliente()
      }
    });
  }

          // Método para manejar la búsqueda por fecha
  onSearchChangeFecha(searchDate: any): void {
    if (searchDate) {
      const selectedDate = new Date(searchDate);
      this.filteredCredito = this.listacredito.filter(credito => {
        const compraDate = new Date(credito.fechaInicio!);
        return compraDate.toLocaleDateString() === selectedDate.toLocaleDateString(); // Compara solo la fecha
      });
    } else {
      this.filteredCredito = [...this.listacredito]; // Si no hay filtro, mostrar todas
    }
  }
 
  

        // Método para manejar la búsqueda por # o totalCompra
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim().toLowerCase(); // Para evitar problemas con mayúsculas/minúsculas
    
    if (searchValue) {
      this.filteredCredito = this.listacredito.filter(credito =>
        (credito.id && credito.id.toString().includes(searchValue)) ||
        (credito.totalCredito && credito.totalCredito.toString().includes(searchValue)) ||
        (credito.ventaId && credito.ventaId.toString().includes(searchValue))   // <-- ventaId
      );
    } else {
      this.filteredCredito = [...this.listacredito];
    }
  }


  generarPDF(): void {
  const fechaActual = formatDate(new Date(), 'dd/MM/yyyy HH:mm', 'en-US');
  const cantidad = this.filteredCredito.length;

  const empresa = this.listaEmpresa[0]; // Solo hay un registro

  // Calcular totales
  const totalCredito = this.filteredCredito.reduce((acc, c) => acc + c.totalCredito, 0);
  const totalSaldo = this.filteredCredito.reduce((acc, c) => acc + c.saldoPendiente, 0);

  // Construir tabla con fila de totales
  const tablaBody = [
    [
      { text: '#', style: 'tableHeader' },
      { text: '#Venta', style: 'tableHeader' },
      { text: 'Fecha Inicio', style: 'tableHeader' },
      { text: 'Estado', style: 'tableHeader' },
      { text: 'Cliente', style: 'tableHeader' },
      { text: 'Total Crédito', style: 'tableHeader' },
      { text: 'Saldo Pendiente', style: 'tableHeader' }
    ],
    ...this.filteredCredito.map((c, index) => [
      index + 1,
      c.ventaId,
      formatDate(c.fechaInicio, 'dd/MM/yyyy', 'en-US'),
      c.estadoCredito,
      c.clienteNombre,
      { text: `L. ${c.totalCredito.toFixed(2)}`, alignment: 'right' },
      { text: `L. ${c.saldoPendiente.toFixed(2)}`, alignment: 'right' }
    ]),
    [
      { text: 'Totales:', colSpan: 5, alignment: 'right', bold: true }, {}, {}, {}, {},
      { text: `L. ${totalCredito.toFixed(2)}`, alignment: 'right', bold: true },
      { text: `L. ${totalSaldo.toFixed(2)}`, alignment: 'right', bold: true }
    ]
  ];

  const contenido: TDocumentDefinitions['content'] = [
    { text: empresa.nombreEmpresa, style: 'header' },
    ...(empresa.eslogan ? [{ text: empresa.eslogan, style: 'eslogan' }] : []),
    {
      columns: [
        { text: `RTN: ${empresa.rtn}`, style: 'infoEmpresa' },
        { text: `Tel: ${empresa.telefono}`, style: 'infoEmpresa', alignment: 'right' }
      ]
    },
    {
      columns: [
        { text: `Correo: ${empresa.correoElectronico}`, style: 'infoEmpresa' },
        { text: `Dirección: ${empresa.direccion}`, style: 'infoEmpresa', alignment: 'right' }
      ],
      margin: [0, 0, 0, 10]
    },
    { text: 'Reporte de Créditos de Ventas', style: 'subheader' },
    { text: `Fecha: ${fechaActual}`, margin: [0, 5, 0, 15] },
    { text: `Resultados encontrados: ${cantidad}`, margin: [0, 0, 0, 10] },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', '*', 'auto', 'auto'],
        body: tablaBody
      },
      layout: 'lightHorizontalLines'
    }
  ];

  const docDefinition: TDocumentDefinitions = {
    content: contenido,
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      eslogan: {
        fontSize: 12,
        italics: true,
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 14,
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      infoEmpresa: {
        fontSize: 10,
        margin: [0, 0, 0, 2]
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'black'
      }
    },
    defaultStyle: {
      fontSize: 10
    },
    pageOrientation: 'landscape'
  };

  pdfMake.createPdf(docDefinition).open();
}







  obtenerDatosDeLaEmpresa(): void {
    this.pefilEmpresaService.getListPerfilEmpresa().subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.listaEmpresa = data;
        }
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

    obtenerListaCreditoCompra(): void {
    this.ventaService.getListCreditoVentas().subscribe(
      (data) => {
        this.listacredito = data;
        this.filteredCredito = [...data]; // Al principio mostramos todos
      },
      (error) => {
        ///console.error('Error al obtener lo creditos de compras', error);
      }
    );
  }



}
