import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
@Component({
  selector: 'app-catalogo-inventario',
  templateUrl: './catalogo-inventario.component.html',
  styleUrls: ['./catalogo-inventario.component.css']
})
export class CatalogoInventarioComponent implements OnInit{

  idRol: number = 0

 public pieChartLabels: string[] = [];

  public pieChartData: ChartData<'pie', number[], string> = {
  labels: [],
  datasets: [
    {
      data: []
    }
  ]
};

  public pieChartType: ChartType = 'pie';
  
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  constructor(private router: Router,
              private authService: AuthService,
              private cdRef: ChangeDetectorRef,
              private reportesService: ReportesService
  ) {}


  ngOnInit(): void {
        // ID del rol
   this.authService._rolId$.subscribe(rol => {
      this.idRol = rol;
      this.cdRef.detectChanges();
    });

     this.cargarDatosGrafico();

  }

cargarDatosGrafico() {
  this.reportesService.obtenerConteoProductosPorBodega().subscribe(res => {
    const datos = res.data;

    const labels = datos.map((d: any) => d.nombreBodega);
    const values = datos.map((d: any) => d.cantidadProductos);

    this.pieChartData = {
      labels: labels,
      datasets: [
        {
          data: values
        }
      ]
    };
  });
}


  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
