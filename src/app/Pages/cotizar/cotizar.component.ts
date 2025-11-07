import { Component, OnInit } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { Cliente } from 'src/app/Clases/cliente';
import { Producto } from 'src/app/Clases/producto';
import { FormControl } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: 'app-cotizar',
  templateUrl: './cotizar.component.html',
  styleUrls: ['./cotizar.component.css']
})
export class CotizarComponent implements OnInit{

  clientes: Cliente[] = [];
  productos: Producto[] = [];

  clienteSeleccionado!: Cliente;
  productoSeleccionado!: Producto;

  historial: any[] = [];
  displayedColumns: string[] = ['ventaId', 'fechaVenta', 'nombreProducto', 'unidadMedida', 'cantidad', 'precioUnitario'];

  clienteControl = new FormControl('');
  productoControl = new FormControl('');

  clientesFiltrados$: Observable<Cliente[]> = new Observable();
  productosFiltrados$: Observable<Producto[]> = new Observable();

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProductos();

    this.clientesFiltrados$ = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarClientes(value || ''))
    );

    this.productosFiltrados$ = this.productoControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarProductos(value || ''))
    );
  }

  filtrarClientes(valor: string): Cliente[] {
    const filtro = valor.toLowerCase();
    return this.clientes.filter(c =>
      c.nombreCliente.toLowerCase().includes(filtro) ||
      (c.telefono?.toString().toLowerCase().includes(filtro))
    );
  }



  filtrarProductos(valor: string): Producto[] {
    const filtro = valor.toLowerCase();
    return this.productos.filter(p =>
      p.nombreProducto.toLowerCase().includes(filtro) ||
       p.codigoProducto.toLowerCase().includes(filtro) ||
      p.codigoBarras?.toLowerCase().includes(filtro)
    );
  }

  
 onClienteSeleccionado(event: MatAutocompleteSelectedEvent) {
  const nombre = event.option.value;
  const encontrado = this.clientes.find(c => c.nombreCliente === nombre);
  if (encontrado) {
    this.clienteSeleccionado = encontrado;
  }
}


onProductoSeleccionado(event: MatAutocompleteSelectedEvent) {
  const nombre = event.option.value;
  const encontrado = this.productos.find(p => p.nombreProducto === nombre);
  if (encontrado) {
    this.productoSeleccionado = encontrado;
  }
}


  cargarClientes(): void {
    this.clienteService.getListClientes().subscribe(clientes => {
      this.clientes = clientes;
    });
  }

  cargarProductos(): void {
    this.productoService.getListProductos().subscribe(productos => {
      this.productos = productos;
    });
  }


  buscarHistorial(): void {
    if (!this.clienteSeleccionado || !this.productoSeleccionado) return;

    this.ventaService.ObtenerHistorialPreciosClienteProducto(
      this.clienteSeleccionado.id!,
      this.productoSeleccionado.id!
    ).subscribe(data => {
      this.historial = data;
      //console.log('Historial cargado:', this.historial);
    });
  }

  
}