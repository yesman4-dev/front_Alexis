import { Component, OnInit } from '@angular/core';
import { AudotoriaService } from 'src/app/services/audotoria.service';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit {

  notificaciones: any[] = [];

  fechaInicio!: string; // Formato yyyy-MM-dd
  fechaFin!: string;

  constructor(private auditoriaService: AudotoriaService) { }

  ngOnInit(): void { }

  cargarNotificaciones() {
    if (!this.fechaInicio || !this.fechaFin) {
      console.warn('Fechas incompletas');
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    this.auditoriaService.getListAudotoriaPorFechas(inicio, fin)
      .subscribe({
        next: (data) => {
          this.notificaciones = data;
          console.log('Notificaciones:', data);
        },
        error: (err) => {
          console.error('Error cargando notificaciones', err);
        }
      });
  }

}
