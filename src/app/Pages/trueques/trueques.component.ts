import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/services/producto.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ClienteService } from 'src/app/services/cliente.service';
import { Catalogos } from 'src/app/Clases/catalogos';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { AuthService } from 'src/app/services/auth.service';
import { Trueque } from 'src/app/Clases/trueque';
import { Cliente } from 'src/app/Clases/cliente';
import { UnidadmedidaService } from 'src/app/services/unidadmedida.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { TruequeService } from 'src/app/services/trueque.service';
import { VentaService } from 'src/app/services/venta.service';
import { DetalleTrueque } from 'src/app/Clases/detalle-trueque';
import { Producto } from 'src/app/Clases/producto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { OpcionesVenta } from 'src/app/Clases/opciones-venta';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from '@angular/common';
import type { Content } from 'pdfmake/interfaces';

@Component({
  selector: 'app-trueques',
  templateUrl: './trueques.component.html',
  styleUrls: ['./trueques.component.css']
})
export class TruequesComponent implements OnInit{


  detallesPendientes: DetalleTrueque[] = []; // 👈 aquí acumulas antes de enviar
  truequeSeleccionadoParaAgregar: number | null = null;

  costoEnvio: number = 0;


    // Para controlar inputs del formulario
  productoControl = new FormControl('');
  productoSeleccionadoObj: Producto | null = null;
  productoEsRecibido: boolean = false;
  productoCantidad: number = 1;
  productoPrecioCosto: number = 0;

  opcionSeleccionadaId: number | null = null;
  historialTrueques: any[] = [];
  //clienteSeleccionadoId: number | null = null;


  idUser: number = 0
  ClienteLista: Cliente [] = []
  ClienteFiltrados: Cliente[] = [];
  ListaLoteDeProducto:any[] = [];
   // Función para actualizar el valor de la unidad de medida cuando un radio button es seleccionado
   stockActualProducto: number = 0;

  opcionesVenta: OpcionesVenta[] = [];
  unidaddeMedidalista: Catalogos[] = [];
   
  
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  productosEntregados: DetalleTrueque[] = [];
  productosRecibidos: DetalleTrueque[] = [];

  unidadMedidaNombre = ""
  presentacionContenidoNombre = ""
  productoUnidadMedidaId: number = 0;

  detalleExtraForm: FormGroup;
  productoForm!: FormGroup;
  constructor(
          private cdRef: ChangeDetectorRef,
          private authService: AuthService,
          private productoService: ProductoService,
          private clienteService: ClienteService,
          private fb: FormBuilder,
           private ventaService: VentaService,
          private toastr: ToastrService,
          private dialog: MatDialog,
          private reportesService: ReportesService,
          private truequeService: TruequeService,
          private unidadmedidaService: UnidadmedidaService
  ){

   

    this.productoForm = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioCosto: [0, Validators.required],
      opcionSeleccionadaId: [null, Validators.required],
      loteProductoId: [0],
      esRecibido: [false, Validators.required] // 👈 ¡Este es el campo que te faltaba!
    });

    this.detalleExtraForm = this.fb.group({
    productoId: [null, Validators.required],
    productoUnidadMedidaId: [null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioCostoUnitario: [0, [Validators.required, Validators.min(0.01)]],
    esRecibido: [false, Validators.required],
    //costoEnvio: [0, [Validators.min(0)]] // 👈 agregamos aquí
  });

  }


  ngOnInit(): void {
    this.authService.userId$.subscribe(id => {
            this.idUser = id; // aqui esta el id del usuario logeado whe 
            this.cdRef.detectChanges();
    });


    this.productoForm.get('opcionSeleccionadaId')?.valueChanges.subscribe(id => {
      this.opcionSeleccionadaId = id;
      this.onUnidadSeleccionada(id); // además actualiza el precio y unidad
    });

    // Optimización del autocomplete
    this.productoControl.valueChanges
    .pipe(
      debounceTime(200),          // espera 200ms después de dejar de tipear
      distinctUntilChanged()      // no dispara si el valor no cambia
    )
    .subscribe(value => {
      this.productosFiltrados = this.filtrarProductosOptimizado(value);
    });

      this.obtenerUnidades();
      this.obtenerListadeCLientes()
      this.obtenerProductos()
  }

  filtrarProductosOptimizado(input: string | Producto | null): Producto[] {
    if (!input) return []; // si es null o vacío, devolvemos vacío

    const term = (typeof input === 'string' ? input : input.nombreProducto)
                .toLowerCase().trim();

    return this.productos.filter(producto =>
      producto.nombreProducto.toLowerCase().includes(term) ||
      producto.codigoProducto?.toLowerCase().includes(term) ||
      producto.codigoBarras?.toLowerCase().includes(term)
    );
  }



  agregarDetalleExtra() {
    if (this.detalleExtraForm.invalid) {
      this.toastr.error('Completa todos los campos correctamente');
      return;
    }

    const detalle = { ...this.detalleExtraForm.value };

    this.detallesPendientes = [...this.detallesPendientes, detalle]; // 👈 Clonando
    this.toastr.success('Producto agregado al detalle');

    this.detalleExtraForm.reset({ cantidad: 1, precioCostoUnitario: 0, esRecibido: false });
  }


  private obtenerTruequeSeleccionado(): any | null {
  // Si hay uno seleccionado manualmente (desde el botón de agregar detalle)
  if (this.truequeSeleccionadoParaAgregar) {
    const sel = this.historialTrueques.find(t => t.id === this.truequeSeleccionadoParaAgregar);
    if (sel) return sel;
  }

  // Si no, busca el primero abierto
  const abierto = this.historialTrueques.find(t => !t.estaCerrado);
  if (abierto) return abierto;

  // Ninguno disponible
  return null;
}


  pagar() {
  const trueque = this.obtenerTruequeSeleccionado();
  if (!trueque) {
    this.toastr.warning('Selecciona un trueque o asegúrate que haya uno abierto.');
    return;
  }

  Swal.fire({
    title: '💸 Pagar al Cliente',
    input: 'number',
    inputAttributes: {
      min: '0.01',
      step: '0.01',
      placeholder: 'Monto a pagar'
    },
    showCancelButton: true,
    confirmButtonText: 'Confirmar Pago',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e53935',
    inputValidator: (value) => {
      if (!value || parseFloat(value) <= 0) {
        return 'Ingresa un monto válido';
      }
      return null;
    }
  }).then(result => {
    if (result.isConfirmed) {
      const monto = parseFloat(result.value!);
      const dto = {
        truequeId: trueque.id,
        montoPago: monto,
        tipoEgresoId: 1 // puedes cambiarlo según tu catálogo de egresos
      };

      this.truequeService.RegistrarPagoFarmacia(dto).subscribe({
        next: res => {
          if (res.data === true) {
            this.toastr.success(res.mensaje, 'Pago registrado');
            this.obtenerListaTrueques();
          } else {
            this.toastr.error(res.mensaje || 'Error al registrar pago');
          }
        },
        error: err => {
          this.toastr.error('Error al registrar pago');
          console.error(err);
        }
      });
    }
  });
}

    cobrar() {
    const trueque = this.obtenerTruequeSeleccionado();
    if (!trueque) {
      this.toastr.warning('Selecciona un trueque o asegúrate que haya uno abierto.');
      return;
    }

    Swal.fire({
      title: '💰 Cobrar al Cliente',
      input: 'number',
      inputAttributes: {
        min: '0.01',
        step: '0.01',
        placeholder: 'Monto recibido'
      },
      showCancelButton: true,
      confirmButtonText: 'Registrar Cobro',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#43a047',
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return 'Ingresa un monto válido';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const monto = parseFloat(result.value!);
        const dto = {
          truequeId: trueque.id,
          montoPago: monto
        };

        this.truequeService.RegistrarPagoCliente(dto).subscribe({
          next: res => {
            if (res.data === true) {
              this.toastr.success(res.mensaje, 'Cobro registrado');
              this.obtenerListaTrueques();
            } else {
              this.toastr.error(res.mensaje || 'Error al registrar cobro');
            }
          },
          error: err => {
            this.toastr.error('Error al registrar cobro');
            console.error(err);
          }
        });
      }
    });
  }




  enviarDetalles() {
    if (this.truequeSeleccionadoParaAgregar === null) {
      this.toastr.error('Selecciona un trueque primero');
      return;
    }

    if (this.detallesPendientes.length === 0) {
      this.toastr.warning('No hay detalles para enviar');
      return;
    }

    const dto = {
      nuevosDetalles: this.detallesPendientes, // todos los detalles acumulados
      usuarioId: Number(this.idUser),
      costoEnvio: this.costoEnvio // 👈 un solo valor para todo el trueque
    };

    this.truequeService.AgregarDetalles(this.truequeSeleccionadoParaAgregar, dto).subscribe({
      next: (res) => {
        if (res.data === true) {
          this.toastr.success(res.mensaje, 'Detalles enviados');
          this.obtenerListaTrueques()
          this.detallesPendientes = []; // limpiar después de enviar
          this.costoEnvio = 0; // limpiar también el costo de envío
          this.truequeSeleccionadoParaAgregar = null;
          this.detalleExtraForm.reset();
        } else {
          this.toastr.error(res.mensaje || 'Error al enviar detalles');
        }
      },
      error: (err) => {
        this.toastr.error('Error al enviar detalles');
        console.error(err);
      }
    });
  }



    
   clienteSeleccionadoId: number | null = null;
  onClienteSeleccionado(cliente: Cliente) {
    this.clienteSeleccionadoId = cliente.id!;

    this.obtenerListaTrueques()

  }

  obtenerListaTrueques(){
    // Traer historial del trueuque cuando selecciona un cliente 
    this.truequeService.ObtenerHistorial(this.clienteSeleccionadoId!).subscribe({
      next: (res) => {
       // console.log("📜 Historial del cliente:", res);
        this.historialTrueques = res.data || []; // Solo la data
      },
      error: (err) => {
       // console.error("❌ Error al obtener historial", err);
        this.toastr.error("No se pudo cargar el historial del cliente");
        this.historialTrueques = [];
      }
    });
  }

     onUnidadSeleccionadaDetalleExtra(idUnidad: number) {
        const opcion = this.opcionesVenta.find(o => o.id === idUnidad);
        if (opcion) {
          // Esto hace que tu formulario extra se valide y habilite el botón
          this.detalleExtraForm.patchValue({
            productoUnidadMedidaId: opcion.id,
            precioCostoUnitario: opcion.precioVenta // o precioCosto si quieres
          });

          // Opcional: actualizar variables locales para mostrar en UI
          this.unidadMedidaNombre = this.getDescripcionUnidad(opcion.unidadMedidaId!);
        }
      }

     onUnidadSeleccionada(idUnidad: number) {
      const opcion = this.opcionesVenta.find(o => o.id === idUnidad);
      if (opcion) {
        this.productoPrecioCosto = opcion.precioVenta; // o precioCosto si es campo distinto
        this.unidadMedidaNombre = this.getDescripcionUnidad(opcion.unidadMedidaId!);
        this.productoUnidadMedidaId = opcion.id!;
      }
    }


    productoSeleccionado(event: MatAutocompleteSelectedEvent): void {
      const producto: Producto = event.option.value;
      if (!producto) return;

      this.productoSeleccionadoObj = producto;

      // 🚀 Aquí seteamos el productoId del formulario extra
      this.detalleExtraForm.patchValue({
        productoId: producto.id
      });

      this.unidadMedidaNombre = producto.unidadMedidaNombre || '';
      this.presentacionContenidoNombre = producto.presentacionContenidoNombre || '';
      this.opcionesVenta = producto.opcionesVenta || [];

      // Limpiar selección anterior de unidad y precio
      this.detalleExtraForm.patchValue({
        productoUnidadMedidaId: null,
        precioCostoUnitario: 0
      });

      this.obtenerLotesPorProducto(producto.id!);
    }




    
  obtenerLotesPorProducto(productoId: number, bodegaId: number = 1): void {
    this.ventaService.ObtenerLotesDisponiblesPorProducto(productoId, bodegaId).subscribe({
      next: (lotes) => {
        this.ListaLoteDeProducto = lotes;
        // Sumamos el total disponible en todos los lotes
        this.stockActualProducto = lotes.reduce((sum, lote) => sum + lote.stockActual, 0);

        if (this.stockActualProducto > 0) {
          this.toastr.success('Producto disponible para la venta', 'Stock disponible');
        } else {
          this.toastr.warning('No hay stock disponible para vender este producto', 'Sin stock');
        }
      },
      error: (err) => {
        this.toastr.error('Error al obtener lotes del producto', 'Error');
        console.error(err);
      }
    });
  }



  calcularSaldo(entrega: any): { texto: string; clase: string } {
    const saldo = entrega.totalClienteEntrega - entrega.totalFarmaciaEntrega;

    if (saldo > 0) {
      return {
         texto: `Yo le debo ${Math.abs(saldo).toLocaleString('es-HN',{style:'currency',currency:'HNL'})}`,
        clase: 'saldo-contra'
     
      };
    } else if (saldo < 0) {
      return {
          texto: `Cliente me debe ${saldo.toLocaleString('es-HN',{style:'currency',currency:'HNL'})}`,
        clase: 'saldo-favor'
      };
    } else {
      return { texto: 'Trueque saldado ✅', clase: 'saldo-cero' };
    }
  }


abrirAgregarDetalle(truequeId: number) {
  this.truequeSeleccionadoParaAgregar = truequeId;
}
  
// Cancelar agregar detalle
cancelarAgregarDetalle() {
  this.truequeSeleccionadoParaAgregar = null;
}

  filtrarClientes(event: any) {
      const input = event.target.value?.toLowerCase() || '';

      if (input.trim() === '') {
        this.ClienteFiltrados = []; // 🔥 No mostramos ningún cliente
        // No borrar clienteId si ya hay un cliente seleccionado
        return;
      }

      this.ClienteFiltrados = this.ClienteLista.filter(p =>
        p.nombreCliente!.toLowerCase().includes(input)
      );
  }
      

  displayCLiente = (id: number) => {
      const cliente = this.ClienteLista.find(p => p.id === id);
      return cliente ? `${cliente.nombreCliente} - ${cliente.telefono}` : '';
  };

  obtenerListadeCLientes(): void {
    this.clienteService.getListClienteActivos().subscribe(
      (data) => {
        this.ClienteLista = data;
      },
      (error) => {
      
      }
    );
  }

  obtenerProductos(){
    this.productoService.getListProductos().subscribe(data => {
      this.productos = data;
      this.productosFiltrados = [];
    });
  }

 filtrarProductos(event: any): void {
      const input = event.target.value.trim().toLowerCase();  // Obtenemos el valor ingresado y lo convertimos a minúsculas para la comparación
      
      if (!input) {
        this.productosFiltrados = [];  // Si no se ha ingresado nada, limpiamos los productos filtrados
      } else {
        this.productosFiltrados = this.productos.filter(producto => 
          producto.nombreProducto.toLowerCase().includes(input) || // Filtrar por nombre de producto
          producto.codigoProducto?.toLowerCase().includes(input) || // O por código del producto
          producto.codigoBarras?.toLowerCase().includes(input) // O por código de barras
        );
      }
    }

    
    displayProducto(producto: Producto | null): string {
    return producto ? `${producto.nombreProducto} - ${producto.laboratorioNombre} - ${producto.presentacionContenidoNombre}` : '';
    }




    crearTrueque(): void {
    if (!this.clienteSeleccionadoId) {
      this.toastr.warning('Seleccione un cliente para continuar');
      return;
    }

    const detalles: DetalleTrueque[] = [
      ...this.productosEntregados,
      ...this.productosRecibidos
    ].map(p => ({
      productoId: p.productoId,
      productoUnidadMedidaId: p.productoUnidadMedidaId,
      loteProductoId: p.loteProductoId,
      cantidad: p.cantidad,
      precioCostoUnitario: p.precioCostoUnitario,
      esRecibido: p.esRecibido
    }));


    const trueque: Trueque = {
      clienteId: this.clienteSeleccionadoId,
      usuarioId: +this.idUser, // Convertir a número
      detalles
    };

    this.truequeService.CrearTrueque(trueque).subscribe({
      next: (res) => {
        
        if (res.data){
            this.toastr.success(res.mensaje, 'Éxito');
            // Reiniciar valores
            this.productosEntregados = [];
            this.productosRecibidos = [];
        }else{
           this.toastr.error(res.mensaje, 'Error');
             console.error(res.mensaje);
        }
        
    
      },
      error: (err) => {
        this.toastr.error('Error al registrar el trueque', 'Error');
        console.error(err);
      }
    });
  }

  agregarProductoManual() {
  if (!this.productoSeleccionadoObj || !this.opcionSeleccionadaId || !this.productoForm.valid) {
    this.toastr.warning('Debe completar todos los campos del producto');
    return;
  }

  const opcion = this.opcionesVenta.find(o => o.id === this.opcionSeleccionadaId);
  if (!opcion) {
    this.toastr.warning('Debe seleccionar una unidad de medida válida');
    return;
  }

  if (!opcion.id) {
  this.toastr.error('Unidad de medida seleccionada no tiene un ID válido.');
  return;
}


    // 🕵️‍♂️ Aquí imprimimos qué se seleccionó en los radio buttons
  console.log('Es recibido:', this.productoForm.value.esRecibido);

const nuevoDetalle: DetalleTrueque = {
  productoId: this.productoSeleccionadoObj.id!,
  productoUnidadMedidaId: opcion.id, // ✅ CAMBIO AQUÍ
  loteProductoId: 0,
  productoNombre: this.productoSeleccionadoObj.nombreProducto!,
  cantidad: this.productoForm.value.cantidad,
  precioCostoUnitario: this.productoForm.value.precioCosto,
  esRecibido: this.productoForm.value.esRecibido,
  unidadMedidaNombre: this.getDescripcionUnidad(opcion.unidadMedidaId!)
};


  this.agregarProductoAlTrueque(nuevoDetalle, nuevoDetalle.esRecibido);

  // 🔄 Limpiar campos después de agregar
  this.productoSeleccionadoObj = null;
  this.productoControl.setValue('');
  this.productosFiltrados = [];
  this.opcionesVenta = [];
  this.opcionSeleccionadaId = null;

  this.productoForm.reset({
    cantidad: 1,
    precioCosto: 0,
    esRecibido: false
  });
}






get totalFarmaciaEntrega(): number {
  return this.productosEntregados.reduce((sum, item) => sum + item.cantidad * item.precioCostoUnitario, 0);
}

get totalClienteEntrega(): number {
  return this.productosRecibidos.reduce((sum, item) => sum + item.cantidad * item.precioCostoUnitario, 0);
}

get totalDiferencia(): number {
  return this.totalClienteEntrega - this.totalFarmaciaEntrega;
}


getDescripcionUnidad(id: number): string {
  const unidad = this.unidaddeMedidalista.find(u => u.id === id);
  return unidad ? unidad.descripcion : 'Unidad desconocida';
}

obtenerUnidades(): void {
  this.unidadmedidaService.getListUnidades().subscribe({
    next: (res) => {
      this.unidaddeMedidalista = res;
    },
    error: () => {
      this.toastr.error('Error al cargar unidades');
    }
  });
}


agregarProductoAlTrueque(producto: DetalleTrueque, esRecibido: boolean) {
    producto.esRecibido = esRecibido;
    if (esRecibido) {
      this.productosRecibidos.push(producto);
    } else {
      this.productosEntregados.push(producto);
    }
}


  generarPDFHistorial() {
  if (!this.historialTrueques || this.historialTrueques.length === 0) {
    this.toastr.warning('No hay historial para generar PDF');
    return;
  }

  const contenido: any[] = [];

  // Encabezado principal
  contenido.push({ 
    text: '🏪 Variedades Alexis', 
    style: 'tituloPrincipal', 
    alignment: 'center', 
    margin: [0, 0, 0, 10] 
  });

  contenido.push({ text: '📜 Historial de Trueques', style: 'header', margin: [0, 0, 0, 10] });

  this.historialTrueques.forEach(trueque => {
    contenido.push({
      text: `Trueque #${trueque.id} - ${formatDate(trueque.fecha, 'short', 'es-HN')}`,
      style: 'subheader',
      margin: [0, 5, 0, 5]
    });

    const saldo = this.calcularSaldo(trueque);
    contenido.push({
      columns: [
        { text: `💰 Cliente Entregó: ${trueque.totalClienteEntrega.toLocaleString('es-HN', { style:'currency', currency:'HNL' })}` },
        { text: `🏥 Farmacia Entregó: ${trueque.totalFarmaciaEntrega.toLocaleString('es-HN', { style:'currency', currency:'HNL' })}` },
        { text: `⚖️ Saldo: ${saldo.texto}`, color: saldo.clase === 'saldo-favor' ? 'green' : saldo.clase === 'saldo-contra' ? 'red' : 'black' }
      ]
    });

    contenido.push({ text: `Estado: ${trueque.estaCerrado ? 'Cerrado' : 'Abierto'}`, margin: [0, 2, 0, 5] });

    const entregados = trueque.detalles
      .filter((d: DetalleTrueque) => !d.esRecibido)
      .map((d: DetalleTrueque) => [
        d.productoNombre,
        d.unidadMedidaNombre,
        d.cantidad,
        d.precioCostoUnitario.toLocaleString('es-HN', { style:'currency', currency:'HNL' }),
        formatDate(d.fecha!, 'short', 'es-HN')
      ]);

    const recibidos = trueque.detalles
      .filter((d: DetalleTrueque) => d.esRecibido)
      .map((d: DetalleTrueque) => [
        d.productoNombre,
        d.unidadMedidaNombre,
        d.cantidad,
        d.precioCostoUnitario.toLocaleString('es-HN', { style:'currency', currency:'HNL' }),
        formatDate(d.fecha!, 'short', 'es-HN')
      ]);

    contenido.push({
      columns: [
        {
          width: '50%',
          stack: [
            { text: '🚚 Entregado por mi farmacia', bold: true, margin: [0,0,0,5], color: '#003366' },
            {
              table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                body: [
                  ['Producto', 'Unidad', 'Cant.', 'Precio', 'Fecha'],
                  ...entregados
                ]
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#cccccc',
                vLineColor: () => '#cccccc',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2
              }
            }
          ],
          margin: [0, 0, 5, 0]
        },
        {
          width: '50%',
          stack: [
            { text: '🎁 Recibido del cliente', bold: true, margin: [0,0,0,5], color: '#336600' },
            {
              table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                body: [
                  ['Producto', 'Unidad', 'Cant.', 'Precio', 'Fecha'],
                  ...recibidos
                ]
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#cccccc',
                vLineColor: () => '#cccccc',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2
              }
            }
          ],
          margin: [5, 0, 0, 0]
        }
      ],
      columnGap: 10,
      margin: [0, 0, 0, 10]
    });

    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 720, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 5, 0, 5] });
  });

  const docDefinition: TDocumentDefinitions = {
    pageOrientation: 'landscape', // 🟢 Horizontal
    content: contenido,
    styles: {
      tituloPrincipal: { fontSize: 20, bold: true, color: '#003366' },
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true, color: '#003366' },
    },
    defaultStyle: { fontSize: 10 }
  };

  pdfMake.createPdf(docDefinition).open();
}





}
