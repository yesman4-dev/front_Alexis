import { Component, OnInit } from '@angular/core';
import { BodegaService } from 'src/app/services/bodega.service';
import { BackendMessage } from 'src/app/modelos/backend-message';

@Component({
  selector: 'app-lotes-yproductos',
  templateUrl: './lotes-yproductos.component.html',
  styleUrls: ['./lotes-yproductos.component.css']
})
export class LotesYProductosComponent implements OnInit {

  lotes: any[] = [];
  lotesPaginados: any[] = [];
  cargando: boolean = false;
  error: string | null = null;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;

  constructor(private bodegaService: BodegaService) {}

  ngOnInit(): void {
    this.obtenerLotesProximosAVencer(90);
  }

  obtenerLotesProximosAVencer(dias: number): void {
    this.cargando = true;
    this.error = null;

    this.bodegaService.getLotesProximosAVencer(dias).subscribe({
      next: (response: BackendMessage) => {
        this.lotes = response.data;
        this.totalPaginas = Math.ceil(this.lotes.length / this.itemsPorPagina);
        this.actualizarPaginacion();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
        this.error = 'Ocurrió un error al cargar los lotes.';
        this.cargando = false;
      }
    });
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.lotesPaginados = this.lotes.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

}