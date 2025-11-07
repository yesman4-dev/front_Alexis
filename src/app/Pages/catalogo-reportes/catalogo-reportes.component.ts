import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ReportesService } from 'src/app/services/reportes.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-catalogo-reportes',
  templateUrl: './catalogo-reportes.component.html',
  styleUrls: ['./catalogo-reportes.component.css']
})
export class CatalogoReportesComponent implements OnInit {

  fechaInicio?: Date;
  fechaFin?: Date;
  private grafico: Chart | undefined;

  constructor(
    private router: Router,
    private reportesService: ReportesService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.actualizarGrafico();  // Llamamos para que el gráfico se cargue al iniciar el componente
  }

  actualizarGrafico(): void {
  // Si no se han seleccionado fechas, usar el día actual
  const hoy = new Date();

  const inicio = this.fechaInicio ? new Date(this.fechaInicio) : new Date(hoy.setHours(0, 0, 0, 0));
  const fin = this.fechaFin ? new Date(this.fechaFin) : new Date(hoy.setHours(23, 59, 59, 999));

  // Aseguramos que la fecha de fin sea al final del día
  fin.setHours(23, 59, 59, 999);

  this.reportesService.obtenerResumenIngresosEgresos(
    inicio.toISOString(),
    fin.toISOString()
  ).subscribe(data => {
    const ingresos = data.totalIngresos;
    const egresos = data.totalEgresos;

    if (this.grafico) {
      this.grafico.destroy();
    }

    const ctx = document.getElementById('graficoIngresosEgresos') as HTMLCanvasElement;
    this.grafico = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [{
          data: [ingresos, egresos],
          backgroundColor: ['#4CAF50', '#F44336'],
          label: 'Lempiras'
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `L ${ctx.raw}`
            }
          }
        }
      }
    });

    this.cdRef.detectChanges();
  });
}


  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
