import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { ReportesService } from 'src/app/services/reportes.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  datosDashboard: any = {};
  ventasPorusuario: any = {};
  cargando: boolean = true;
  error: string | null = null;
  fechaHoy: Date = new Date();

  barChartData: any;
  barChartLabels: string[] = [];
  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Ventas por usuario hoy' }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#e0e0e0' } }
    }
  };

  constructor(private reportesService: ReportesService) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.cargarVentasPorusuario();  // <- Importante: Llamar aquí también
  }

  cargarDatosDashboard(): void {
    this.reportesService.ResumendeDatosGeneral().subscribe({
      next: (data) => {
        this.datosDashboard = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el dashboard:', err);
        this.error = 'Hubo un problema al obtener los datos.';
        this.cargando = false;
      }
    });
  }

  cargarVentasPorusuario(): void {
    this.reportesService.obtenerCantidadeVentasPorUsuario().subscribe({
      next: (data) => {
        this.ventasPorusuario = data;

        const colores = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#00C853', '#C51162', '#AA00FF', '#0091EA', '#FF1744', '#D50000'
        ];

        this.barChartLabels = data.map((x: any) => x.nombreUsuario);

        this.barChartData = {
          labels: this.barChartLabels,
          datasets: [
            {
              data: data.map((x: any) => x.cantidadVentas),
              label: 'Cantidad de Ventas',
              backgroundColor: data.map((_: any, index: number) => colores[index % colores.length])
            }
          ]
        };
      },
      error: (err) => {
        console.error('Error al cargar ventas por usuario:', err);
      }
    });
  }

}
