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
import { ModaldetalleComprasComponent } from '../modaldetalle-compras/modaldetalle-compras.component';
import { ModaldetalleCreditocompraComponent } from '../modaldetalle-creditocompra/modaldetalle-creditocompra.component';
import { ModalpagocreditoCompraComponent } from '../modalpagocredito-compra/modalpagocredito-compra.component';


@Component({
  selector: 'app-credito-proveddordetalle',
  templateUrl: './credito-proveddordetalle.component.html',
  styleUrls: ['./credito-proveddordetalle.component.css']
})
export class CreditoProveddordetalleComponent implements OnInit{

  listacredito: any [] = [];
  proveedorId!: number;
  filteredCredito: any[] = [];
  displayedColumns: string[] = ['id','compraId', 'fechaInicio', 'estado', 'nombreProveedor',  'totalCredito', 'saldoPendiente', 'acciones'];
  
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
    this.proveedorId = Number(this.route.snapshot.paramMap.get('id'));

    this.obenerCreditoDeProveedor()
    this.obtenerDatosDeLaEmpresa();

  }

  
  obenerCreditoDeProveedor(){
    if (this.proveedorId) {
        this.audotoriaService.getCreditosPorProveedor(this.proveedorId).subscribe({
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

  abrirModalDetalleCompra(compraId: number): void {
    this.dialog.open(ModaldetalleComprasComponent, {
      width: '700px',
      data: compraId
    });
  }

    // Método que manejará la acción del botón
  verDetalleVentaCredito(ceditoCompra: any) {
    this.dialog.open(ModaldetalleCreditocompraComponent, {
      width: '700px',
      data: ceditoCompra
    });
  }

                // Método que manejará la acción del botón
  abrirModalAbonar(ceditoCompra: any) {
    const dialogRef = this.dialog.open(ModalpagocreditoCompraComponent, {
      width: '400px',
      data: ceditoCompra,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
       this.obenerCreditoDeProveedor()
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
        (credito.compraId && credito.compraId.toString().includes(searchValue))
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
        { text: 'Proveedor', style: 'tableHeader' },
        { text: 'Total Crédito', style: 'tableHeader' },
        { text: 'Saldo Pendiente', style: 'tableHeader' }
      ],
      ...this.filteredCredito.map((c, index) => [
        index + 1,
        c.compraId,
        formatDate(c.fechaInicio, 'dd/MM/yyyy', 'en-US'),
        c.estado,
        c.nombreProveedor,
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
      { text: 'Reporte de Créditos de Compras', style: 'subheader' },
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
