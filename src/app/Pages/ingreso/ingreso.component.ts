import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { IngresoService } from 'src/app/services/ingreso.service';
import { Ingreso } from 'src/app/Clases/ingreso';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { Url } from 'src/app/modelos/url'; // url: 'https://localhost:7100', // URL local

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from '@angular/common';
import { PefilEmpresaService } from 'src/app/services/pefil-empresa.service';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit, AfterViewInit{

  @ViewChild(MatPaginator) paginator!: MatPaginator;

    listaEmpresa: any[] = [];
    EgresoForm: FormGroup;
    filtroForm: FormGroup;
    displayedColumns: string[] = ['descripcion', 'valorIngreso', 'fechaRegistro'];
    dataSource = new MatTableDataSource<Ingreso>();
    filteredDataSource = new MatTableDataSource<Ingreso>();

  constructor(
    private ingresoService: IngresoService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
     private pefilEmpresaService: PefilEmpresaService
  ) {
    this.EgresoForm = this.fb.group({
      descripcion: ['', Validators.required],
      valorIngreso: ['', Validators.required],
    });

    this.filtroForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
    });

    //(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngAfterViewInit(): void {
    this.filteredDataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.obtenerDatosDeLaEmpresa()
    this.obtenerIngresos()
  }

  crearIngreso(): void {
    if (this.EgresoForm.invalid) return;

    const egreso = new Ingreso(this.EgresoForm.value);

    this.ingresoService.Crear(egreso).subscribe({
      next: (res) => {
        this.toastr.success(res.mensaje, 'Éxito');
        this.EgresoForm.reset();
        this.obtenerIngresos();
      },
      error: () => this.toastr.error('Error al registrar egreso', 'Error')
    });
  }

    obtenerIngresos(): void {
    this.ingresoService.ObtenerTodos().subscribe({
      next: (ingreso) => {
        this.dataSource.data = ingreso;
        this.filteredDataSource.data = ingreso;
      },
      error: () => this.toastr.error('Error al cargar ingreso', 'Error')
    });
  }

  
  filtrarIngresos(): void {
    if (this.filtroForm.invalid) return;

    const { fechaInicio, fechaFinal } = this.filtroForm.value;

    const fechaInicioISO = new Date(fechaInicio).toISOString();
    const fechaFinalISO = new Date(fechaFinal).toISOString();

    this.ingresoService.Filtrar(fechaInicioISO, fechaFinalISO).subscribe({
      next: (res: BackendMessage) => {
        if (res.data) {
          this.filteredDataSource.data = res.data;
        } else {
          this.toastr.warning(res.mensaje, 'Atención');
        }
      },
      error: () => this.toastr.error('Error al filtrar ingresos', 'Error')
    });
  }

  obtenerDatosDeLaEmpresa(): void {
      this.pefilEmpresaService.getListPerfilEmpresa().subscribe(
        (data) => {
      
      //  console.log('Logo response:', data);

          if (data && data.length > 0) {
            this.listaEmpresa = data;
          }
        },
        (error) => {
          
        }
      );  
  }

async generarPdf(): Promise<void> {
  if (this.filteredDataSource.data.length === 0) {
    this.toastr.warning('No hay datos para exportar.', 'Atención');
    return;
  }

  const empresa = this.listaEmpresa[0];
  const ingresos = this.filteredDataSource.data;
  const fechaActual = formatDate(new Date(), 'dd/MM/yyyy', 'es-HN');

  let logoBase64 = '';
  try {
    if (empresa.logo) {
      logoBase64 = await this.getBase64ImageFromURL(`${Url.url}/${empresa.logo}`);
    }
  } catch (err) {
    console.warn('No se pudo cargar el logo:', err);
  }

  const body: any[] = [
    [
      { text: 'Descripción', bold: true, fillColor: '#f1f1f1', alignment: 'center' },
      { text: 'Valor (L)', bold: true, fillColor: '#f1f1f1', alignment: 'center' },
      { text: 'Fecha', bold: true, fillColor: '#f1f1f1', alignment: 'center' }
    ]
  ];

  ingresos.forEach(i => {
    body.push([
      i.descripcion || '',
      { text: i.valorIngreso?.toLocaleString('es-HN', { minimumFractionDigits: 2 }) || '0.00', alignment: 'right' },
      formatDate(i.fechaRegistro, 'dd/MM/yyyy', 'es-HN')
    ]);
  });

  const total = ingresos.reduce((sum, i) => sum + (i.valorIngreso || 0), 0);

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 100, 40, 60],
    header: [
      {
        columns: [
          logoBase64
            ? { image: logoBase64, width: 60, height: 60, margin: [0, 0, 10, 0] }
            : { text: '', width: 60 },
          {
            stack: [
              { text: empresa.nombreEmpresa, style: 'header' },
              { text: `RTN: ${empresa.rtn}`, margin: [0, 5] },
              { text: empresa.direccion },
              { text: empresa.telefono },
              { text: empresa.eslogan, italics: true, margin: [0, 5] }
            ],
            alignment: 'center'
          }
        ]
      },
      {
        text: `Fecha del reporte: ${fechaActual}`,
        alignment: 'right',
        margin: [0, 10, 20, 0],
        fontSize: 10
      }
    ],
    content: [
      { text: 'REPORTE DE INGRESOS', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto', 'auto'],
          body: body
        },
        layout: 'lightHorizontalLines'
      },
      {
        text: `\nTotal ingresado: L ${total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`,
        alignment: 'right',
        bold: true,
        margin: [0, 10, 0, 0],
        fontSize: 12,
        color: '#1c7ed6'
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#0a2d59',
        margin: [0, 0, 0, 5]
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: '#1c7ed6',
        margin: [0, 0, 0, 10]
      }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}

    
    
    
    async getBase64ImageFromURL(url: string): Promise<string> {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    


}
