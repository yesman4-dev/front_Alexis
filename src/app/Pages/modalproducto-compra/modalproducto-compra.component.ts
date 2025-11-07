import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, RequiredValidator } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductoService } from 'src/app/services/producto.service';
import { Producto } from 'src/app/Clases/producto';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-modalproducto-compra',
  templateUrl: './modalproducto-compra.component.html',
  styleUrls: ['./modalproducto-compra.component.css']
})
export class ModalproductoCompraComponent implements OnInit {

  productoForm: FormGroup;
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  detalleProductos: any[] = [];
  dataSource = new MatTableDataSource<any>();
  columnas: string[] = ['nombre', 'precio', 'cantidad', 'acciones'];

  unidadMedidaNombre = ""
  presentacionContenidoNombre = ""

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalproductoCompraComponent>,
    private productoService: ProductoService
  ) {
    this.productoForm = this.fb.group({
      producto: [''],
      precioCompra: [''],
      cantidad: ['']
    });
  }

  ngOnInit(): void {
    this.productoService.getListProductos().subscribe(data => {
      this.productos = data;
      // Dejamos productosFiltrados vacío hasta que se escriba algo
      this.productosFiltrados = [];
    });
  
    this.productoForm.get('producto')?.valueChanges.subscribe(value => {
      const filtro = typeof value === 'string' ? value.trim().toLowerCase() : '';
    
      if (!filtro) {
        this.productosFiltrados = []; // Nada que mostrar
        return;
      }
    
      this.productosFiltrados = this.productos.filter(p =>
        p.nombreProducto.toLowerCase().includes(filtro) ||
        p.codigoProducto?.toLowerCase().includes(filtro) ||
        p.codigoBarras?.toLowerCase().includes(filtro)
      );
    });
    
  }
  

  displayProducto(producto: Producto): string {
    this.unidadMedidaNombre = producto.unidadMedidaNombre!;
    this.presentacionContenidoNombre = producto.presentacionContenidoNombre!
    return producto ? `${producto.nombreProducto} - ${producto.laboratorioNombre} - ${producto.presentacionContenidoNombre}` : '';
   
  }

  agregarProducto(): void {
    const { producto, precioCompra, cantidad } = this.productoForm.value;
    if (producto && precioCompra && cantidad) {
      this.detalleProductos.push({
        productoId: producto.id,
        nombre: this.displayProducto(producto),
        precio: precioCompra,
        cantidad: cantidad,
        unidadMedidaNombre: this.unidadMedidaNombre,
        presentacionContenidoNombre: this.presentacionContenidoNombre
        
      });
      this.dataSource.data = this.detalleProductos;
      this.productoForm.reset();
    }
  }

  eliminarProducto(producto: any): void {
    this.detalleProductos = this.detalleProductos.filter(p => p !== producto);
    this.dataSource.data = this.detalleProductos;
  }

  confirmar(): void {
  
    this.dialogRef.close(this.detalleProductos);
  }
}
