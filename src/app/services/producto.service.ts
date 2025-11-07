import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { OpcionesVenta } from '../Clases/opciones-venta';
import { Producto } from '../Clases/producto';
import { HttpHeaders } from '@angular/common/http';
import { RebajarStokDTO } from '../modelos/rebajar-stok-dto';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpClient) { }

      //metodo para crear un proveedor
    Crear(producto: Producto): Observable<BackendMessage> {
      const url = Url.url + '/api/Producto/Crear';
          return this.http.post<BackendMessage>(url, producto);
    }

    //para rebajar stok manualmente 
    RebajarStockManual(dto: RebajarStokDTO): Observable<BackendMessage> {
    const url = Url.url + '/api/Producto/RebajarStockManual';
    return this.http.post<BackendMessage>(url, dto);
    }

    EditarPrecioUnidadMedida(id: number, nuevoPrecioVenta: number): Observable<BackendMessage> {
        const url = Url.url + '/api/Producto/EditarPrecioUnidadMedida';

        const body = {
          id: id,
          nuevoPrecioVenta: nuevoPrecioVenta
        };

        return this.http.put<BackendMessage>(url, body);
    }


    // Subir un archivo al backend
    SubirArchivo(archivo: File): Observable<BackendMessage> {
      const url = Url.url + '/api/Producto/upload';
      const formData = new FormData();
      formData.append('archivo', archivo); 
        
      return this.http.post<BackendMessage>(url, formData);
    }

    GenerarCodigo(nombreProducto: string): Observable<any> {
      const url = Url.url + '/api/Producto/generar-codigo?nombreProducto=' + encodeURIComponent(nombreProducto);
      return this.http.get<any>(url); // Se asegura de que el backend retorne un objeto con 'data', 'mensaje' y 'token'
    }


    //hay que hacer un metodo que me permita traer los productos activos unicamente

    //me mmuestra todos los productos
    getListProductos(): Observable<Producto[]> {  
      const url = Url.url + '/api/Producto/ListaProductos';
      return this.http.get<Producto[]>(url);
    }

    // Buscar productos por nombre, código o código de barras
    buscarProductos(filtro: string): Observable<Producto[]> {
      const url = `${Url.url}/api/Producto/Buscar?filtro=${encodeURIComponent(filtro)}`;
      return this.http.get<Producto[]>(url);
    }

    cambiarEstadoProducto(id: number, esActivo: boolean): Observable<BackendMessage> {
      return this.http.put<BackendMessage>(`${Url.url}/api/Producto/cambiar-estado/${id}`, { esActivo });
    }

    ModificarProducto(id: number, encabezado: Producto): Observable<BackendMessage> {
        const url = `${Url.url}/api/Producto/actualiza-producto/${id}`;
        return this.http.put<BackendMessage>(url, encabezado);
    }

    //para continuarle agregando unidades de medida a un producto ya existente
    AgregarUnidadMedidaAProducto(productoId: number, dto: any): Observable<BackendMessage> {
      const url = `${Url.url}/api/Producto/${productoId}/AgregarUnidadMedida`;
      return this.http.post<BackendMessage>(url, dto);
    }



}
