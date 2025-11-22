import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BodegaService } from 'src/app/services/bodega.service';
import { ModalmovimientoBodegaComponent } from '../modalmovimiento-bodega/modalmovimiento-bodega.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from '@angular/common';
import { ProductoService } from 'src/app/services/producto.service';
import { LoteInventarioInicialDTO } from 'src/app/modelos/inventariar-dto';
import { ModalRebajarStokkComponent } from '../modal-rebajar-stokk/modal-rebajar-stokk.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detalle-bodegas',
  templateUrl: './detalle-bodegas.component.html',
  styleUrls: ['./detalle-bodegas.component.css']
})
export class DetalleBodegasComponent implements OnInit {
  idRol: number = 0
  bodegas: any[] = [];

  constructor(private bodegaService: BodegaService,
                private dialog: MatDialog,
                private authService: AuthService,
                private cdRef: ChangeDetectorRef,
                private productoService: ProductoService,
                private toastr: ToastrService,
              ) 
  {
    // (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    this.cargarInventario();

    this.authService._rolId$.subscribe(rol => {
    this.idRol = rol;
    this.cdRef.detectChanges();
    });

  }

  cargarInventario(): void {
    this.bodegaService.ObtenerInventarioGeneralPorBodega().subscribe({
      next: (res) => {
        this.bodegas = res.data;
        this.bodegas.forEach(bodega => {
          bodega.isOpen = false;
          bodega.filtro = ''; // <- Nuevo: inicializa filtro vacío
        });
      }
    });
  }

    // Nuevo método para filtrar productos de una bodega
  filtrarProductos(bodega: any): any[] {
    if (!bodega.filtro) return bodega.productos;
    const filtro = bodega.filtro.toLowerCase();
    return bodega.productos.filter((p: any) =>
      p.nombreProducto.toLowerCase().includes(filtro)
    );
  }

  toggleBodega(bodegaId: number): void {
    const bodega = this.bodegas.find(b => b.bodegaId === bodegaId);
    if (bodega) {
      bodega.isOpen = !bodega.isOpen; // Cambia el estado de expansión de la bodega
    }
  }

  
generarPDFPorBodega(bodega: any): void {
  const fecha = formatDate(new Date(), 'dd/MM/yyyy HH:mm', 'en-US');
  const productosFiltrados = this.filtrarProductos(bodega);

  const contentArray: any[] = [];

  // 📌 Título
  contentArray.push(
    { text: '📦 Reporte de Inventario por Bodega', style: 'titulo', alignment: 'center' },
    { text: `Bodega: ${bodega.nombreBodega}`, style: 'subtitulo', alignment: 'center' },
    '\n'
  );

  // 📌 Totales por bodega
  contentArray.push({
    table: {
      widths: ['*', '*'],
      body: [
        [
          { text: `Valor total (lotes): L. ${bodega.valorTotalBodega.toFixed(2)}`, style: 'total' },
          { text: `Valor total (unidad dominante): L. ${bodega.valorTotalBodegaDominante.toFixed(2)}`, style: 'total' }
        ]
      ]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 10]
  });

  // 📌 Detalle por producto
  productosFiltrados.forEach((p: any) => {
    // TABLA PRINCIPAL
    contentArray.push({
      table: {
        widths: ['30%', '15%', '15%', '15%', '25%'],
        headerRows: 1,
        body: [
          [
            { text: 'Producto', style: 'tableHeader' },
            { text: 'Unidad Dominante', style: 'tableHeader' },
            { text: 'Stock Dominante', style: 'tableHeader' },
            { text: 'Stock Mínimo', style: 'tableHeader' },
            { text: 'Valor Inventario', style: 'tableHeader' }
          ],
          [
            { text: p.nombreProducto, style: 'tableCell' },
            { text: p.unidadDominante.unidadMedida, style: 'tableCell' },
            { text: p.stockEnUnidadDominante.toString(), style: 'tableCell' },
            { text: p.stockMinimoTotal.toString(), style: 'tableCell' },
            { text: `L. ${p.valorInventario.toFixed(2)}`, style: 'tableCell' }
          ]
        ]
      },
      layout: {
        fillColor: (rowIndex: number) =>
          rowIndex === 0 ? '#1976d2' : (rowIndex % 2 === 0 ? '#f1f1f1' : null),
        hLineColor: () => '#ccc',
        vLineColor: () => '#ccc'
      },
      margin: [0, 10, 0, 0]
    });

    // SUBTABLA DE PRESENTACIONES
    contentArray.push({
      table: {
        widths: ['50%', '50%'],
        headerRows: 1,
        body: [
          [
            { text: 'Presentación', style: 'subHeader' },
            { text: 'Stock', style: 'subHeader' }
          ],
          ...p.presentaciones.map((pr: any) => [
            pr.unidadMedida,
            pr.stock.toString()
          ])
        ]
      },
      layout: {
        fillColor: (rowIndex: number) =>
          rowIndex === 0 ? '#eceff1' : (rowIndex % 2 === 0 ? '#fafafa' : null),
        hLineColor: () => '#ddd',
        vLineColor: () => '#ddd'
      },
      margin: [0, 0, 0, 15]
    });
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    header: {
      columns: [
        {
          text: 'Variedades Alexis',
          style: 'empresa',
          alignment: 'left',
          margin: [40, 20, 0, 0]
        },
        {
          text: `Fecha: ${fecha}`,
          alignment: 'right',
          margin: [0, 20, 40, 0],
          style: 'fecha'
        }
      ]
    },

    footer: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'center',
      margin: [0, 10, 0, 0],
      fontSize: 9,
      color: 'gray'
    }),

    content: contentArray,

    styles: {
      empresa: { fontSize: 14, bold: true, color: '#1976d2' },
      fecha: { fontSize: 10, color: 'gray' },
      titulo: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      subtitulo: { fontSize: 13, italics: true, margin: [0, 0, 0, 20] },

      total: {
        fontSize: 11,
        bold: true,
        alignment: 'center',
        color: '#0d47a1'
      },

      tableHeader: {
        fillColor: '#1976d2',
        color: 'white',
        bold: true,
        fontSize: 11,
        alignment: 'center',
        margin: [0, 5]
      },

      tableCell: {
        fontSize: 10,
        margin: [0, 5],
        alignment: 'center'
      },

      subHeader: {
        fillColor: '#263238',
        color: 'white',
        bold: true,
        fontSize: 10,
        alignment: 'center'
      }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}


 abrirModalRebajarStock(producto: any, bodega: any, presentacion: any) {
  const dataModal = {
    productoId: producto.productoId,
    productoUnidadMedidaId: presentacion.productoUnidadMedidaId, // Cambiado aquí
    bodegaId: bodega.bodegaId,
    nombreProducto: producto.nombreProducto,
    unidadMedida: presentacion.unidadMedida,
    stockActual: presentacion.stock
  };

  const dialogRef = this.dialog.open(ModalRebajarStokkComponent, {
    width: '400px',
    data: dataModal
  });

  dialogRef.afterClosed().subscribe(cantidadRebajada => {
    if (cantidadRebajada) {
      const payload = {
        productoId: dataModal.productoId,
        productoUnidadMedidaId: dataModal.productoUnidadMedidaId, // Cambiado aquí
        bodegaId: dataModal.bodegaId,
        cantidad: cantidadRebajada
      };

      console.log('🔍 Enviando payload al backend:', payload);

      this.productoService.RebajarStockManual(payload).subscribe({
        next: res => {
          if (res.data) {
            this.toastr.success(res.mensaje, 'Éxito');
          } else {
            this.toastr.warning(res.mensaje, 'Error');
          }
          console.log('✅ Respuesta del backend:', res);
          this.cargarInventario();
        },
        error: err => {
          console.error('❌ Error al rebajar stock', err);
        }
      });
    }
  });
}

  modalMovimientoBodega(producto: any, bodegaOrigen: any): void {
    const dialogRef = this.dialog.open(ModalmovimientoBodegaComponent, {
      width: '80%',
      maxWidth: '400px',
      autoFocus: false,
      data: {
        producto,
        bodegaOrigen,
        bodegasDisponibles: this.bodegas.filter(b => b.bodegaId !== bodegaOrigen.bodegaId)
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
        this.cargarInventario();
    });
  }




}
