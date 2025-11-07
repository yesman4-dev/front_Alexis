import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { Catalogos } from '../Clases/catalogos';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {

  constructor(private http: HttpClient) { }

  Crear(bodega: Catalogos): Observable<BackendMessage> {
    const url = Url.url + '/api/Bodega/Crear';
    return this.http.post<BackendMessage>(url, bodega);
  }

  getLotesProximosAVencer(dias: number): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/LotesProximosAVencer?dias=${dias}`;
    return this.http.get<BackendMessage>(url);
  }

  getListBodegas(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/Bodega/ListaBodegas';
    return this.http.get<Catalogos[]>(url);
  }

  getListBodegasActivas(): Observable<Catalogos[]> {  
    const url = Url.url + '/api/Bodega/ListaBodegasActivas';
    return this.http.get<Catalogos[]>(url);
  }

  cambiarEstadoBodega(id: number, esActivo: boolean): Observable<BackendMessage> {
    return this.http.put<BackendMessage>(`${Url.url}/api/Bodega/cambiar-estado/${id}`, { esActivo });
  }

  ModificarBodega(id: number, encabezado: Catalogos): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/actualiza-bodega/${id}`;
    return this.http.put<BackendMessage>(url, encabezado);
  }

  // Mover producto entre bodegas
  MoverProducto(dto: any): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/mover-producto`;
    return this.http.post<BackendMessage>(url, dto);
  }

  // Obtener inventario por bodega
  ObtenerInventarioPorBodega(bodegaId: number): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/Inventario/${bodegaId}`;
    return this.http.get<BackendMessage>(url);
  }

  // Obtener inventario con lotes por bodega
  ObtenerInventarioConLotesPorBodega(bodegaId: number): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/InventarioConLotes/${bodegaId}`;
    return this.http.get<BackendMessage>(url);
  }

  // Obtener productos con lotes próximos a vencer
  ObtenerProductosProximosAVencer(dias: number = 90): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/LotesProximosAVencer?dias=${dias}`;
    return this.http.get<BackendMessage>(url);
  }

  // Obtener lote por ID
  ObtenerLotePorId(loteId: number): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/Lote/${loteId}`;
    return this.http.get<BackendMessage>(url);
  }

  // Obtener inventario general de todas las bodegas
  ObtenerInventarioGeneralPorBodega(): Observable<BackendMessage> {
    const url = `${Url.url}/api/Bodega/InventarioBodegas`;
    return this.http.get<BackendMessage>(url);
  }
}
