import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendMessage } from '../modelos/backend-message';
import { Url } from '../modelos/url';
import { OpcionesVenta } from '../Clases/opciones-venta';
import { Compras } from '../Clases/compras';
import { HttpHeaders } from '@angular/common/http';
import { InventarioInicialProductoDTO } from '../modelos/inventariar-dto';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  constructor(private http: HttpClient) { }

      // para obtener una compra específica por su ID
    getCompraPorId(id: number): Observable<Compras> {
      const url = `${Url.url}/api/Compras/VerCompra/${id}`;
      return this.http.get<Compras>(url);
    }

      //para llenar el encabezado de compras
    getListCompras(): Observable<Compras[]> {  
        const url = Url.url + '/api/Compras/ListaCompras';
        return this.http.get<Compras[]>(url);
    }

  // Eliminar una compra por su ID
    EliminarCompra(compraId: number): Observable<BackendMessage> {
      const url = `${Url.url}/api/Compras/EliminarCompra/${compraId}`;
      return this.http.delete<BackendMessage>(url).pipe(
        catchError(err => {
          console.error('Error al eliminar compra:', err);
          return throwError(() => err);
        })
      );
    }

      // Revertir compra de contado a crédito o de crédito a contado
    RevertirTipoCompra(compraId: number): Observable<BackendMessage> {
      const url = `${Url.url}/api/Compras/RevertirTipoCompra/${compraId}`;
      return this.http.put<BackendMessage>(url, null).pipe(
        catchError(err => {
          console.error('Error al revertir tipo de compra:', err);
          return throwError(() => err);
        })
      );
    }

     //metodo para crear una compra 
    Crear(compra: Compras): Observable<BackendMessage> {
        const url = Url.url + '/api/Compras/Crear';
        return this.http.post<BackendMessage>(url, compra);
    }



   //para llenar el encabezado de credito de compras
    getListCreditoCompras(): Observable<Compras[]> {  
      const url = Url.url + '/api/CreditoCompra/ListaCreditoCompra';
      return this.http.get<Compras[]>(url);
    }

    
  // para alimentar el sistema con inventario manualmente sin hacer compras
  registrarInventarioInicial(productos: InventarioInicialProductoDTO[]): Observable<BackendMessage> {
    const url = Url.url + '/api/Compras/RegistrarInventarioInicial';
    return this.http.post<BackendMessage>(url, productos);
  }

     //metodo para abonar o pagar saldo de un credito de compra
     PagarSaldoCreditoCompra(creditoCompraId: number, pago: any): Observable<BackendMessage> {
      const url = `${Url.url}/api/CreditoCompra/abonar/${creditoCompraId}`;
      return this.http.post<BackendMessage>(url, pago);
    }
    

}
