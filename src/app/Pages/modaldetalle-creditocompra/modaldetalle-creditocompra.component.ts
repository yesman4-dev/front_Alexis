import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-modaldetalle-creditocompra',
  templateUrl: './modaldetalle-creditocompra.component.html',
  styleUrls: ['./modaldetalle-creditocompra.component.css']
})
export class ModaldetalleCreditocompraComponent  {

  columnasHistorial: string[] = ['fechaPago', 'montoPagado', 'observacion', 'usuarioNombre'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
   // (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }



  generarPDF(): void {
    const credito = this.data;
    const pagos = credito.pagoCreditoCompras;
  
    const fechaFormateada = (fecha: string) =>
      formatDate(fecha, 'dd/MM/yyyy hh:mm a', 'es-HN');
  
    const totalPagos = pagos.length;
    const totalAbonado = pagos.reduce((acc: number, pago: any) => acc + pago.montoPagado, 0);
  
    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          text: 'Detalle del Crédito de Compra',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            { text: `Proveedor: ${credito.nombreProveedor}`, style: 'subheader' },
            { text: `Estado: ${credito.estado}`, style: 'subheader', alignment: 'right' }
          ]
        },
        {
          columns: [
            { text: `Fecha Inicio: ${fechaFormateada(credito.fechaInicio)}`, margin: [0, 5, 0, 5] },
          ]
        },
        {
          columns: [
            { text: `Total Crédito: L ${credito.totalCredito.toFixed(2)}`, bold: true },
            { text: `Saldo Pendiente: L ${credito.saldoPendiente.toFixed(2)}`, alignment: 'right', bold: true }
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: `Pagos Realizados: ${totalPagos} | Total Abonado: L ${totalAbonado.toFixed(2)}`,
          italics: true,
          margin: [0, 0, 0, 15]
        },
        {
          text: 'Historial de Pagos',
          style: 'subheader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', 'auto', '*', '*'],
            body: [
              [
                { text: 'Fecha de Pago', style: 'tableHeader' },
                { text: 'Monto Pagado', style: 'tableHeader' },
                { text: 'Observación', style: 'tableHeader' },
                { text: 'Usuario', style: 'tableHeader' }
              ],
              ...pagos.map((p: any) => [
                fechaFormateada(p.fechaPago),
                `L ${p.montoPagado.toFixed(2)}`,
                p.observacion,
                p.usuarioNombre
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 12,
          bold: true
        },
        tableHeader: {
          bold: true,
          fillColor: '#eeeeee',
          fontSize: 11
        }
      },
      defaultStyle: {
        fontSize: 10
      },
      pageMargins: [30, 40, 30, 30]
    };
  
    pdfMake.createPdf(documentDefinition).open();
  }
  


}
