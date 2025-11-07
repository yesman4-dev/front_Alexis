import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import {MatMenuModule} from '@angular/material/menu';
//import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {NgIf, NgFor} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { MatListModule } from '@angular/material/list'; 
import { MatBadgeModule } from '@angular/material/badge';
import localEs from '@angular/common/locales/es';
import { MatTabsModule } from '@angular/material/tabs';
import {FullCalendarModule } from '@fullcalendar/angular';
import {MatExpansionModule} from '@angular/material/expansion';
import { LoginComponent } from './Pages/login/login.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

// Charts
import { NgChartsModule } from 'ng2-charts';

import { WelcomeComponent } from './welcome/welcome.component';
import { AuthInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeComponent } from './Pages/home/home.component';
import { UsuarioComponent } from './Pages/usuario/usuario.component';
import { ModalUsuarioComponent } from './Pages/modal-usuario/modal-usuario.component';
import { ModalclaveUsuarioComponent } from './Pages/modalclave-usuario/modalclave-usuario.component';
import { ProveedorComponent } from './Pages/proveedor/proveedor.component';
import { ModalProveedorComponent } from './Pages/modal-proveedor/modal-proveedor.component';
import { CatalogoComponent } from './Pages/catalogo/catalogo.component';
import { BodegasComponent } from './Pages/bodegas/bodegas.component';
import { ModalBodegaComponent } from './Pages/bodegas/modal-bodega/modal-bodega.component';
import { UnidadComponent } from './Pages/unidad/unidad.component';
import { UnidadModalComponent} from './Pages/unidad/unidad-modal/unidad-modal.component';
import { CategoriaComponent } from './Pages/categoria/categoria.component';
import { CategoriaModaComponent } from './Pages/categoria/categoria-moda/categoria-moda.component';
import { LaboratorioComponent } from './Pages/laboratorio/laboratorio.component';
import { LaboratorioModalComponent } from './Pages/laboratorio/laboratorio-modal/laboratorio-modal.component';
import { PresentacionContenidoComponent } from './Pages/presentacion-contenido/presentacion-contenido.component';
import { ModalPresentacionComponent } from './Pages/modal-presentacion/modal-presentacion.component';
import { EditProductoComponent } from './Pages/add-producto/edit-producto.component';
import { CatalogoInventarioComponent } from './Pages/catalogo-inventario/catalogo-inventario.component';
import { EditarProductoComponent } from './Pages/editar-producto/editar-producto.component';
import { CatalogoComprasComponent } from './Pages/catalogo-compras/catalogo-compras.component';
import { CrearCompraComponent } from './Pages/crear-compra/crear-compra.component';
import { ModalproductoCompraComponent } from './Pages/modalproducto-compra/modalproducto-compra.component';
import { ModalLoteproductoComponent } from './Pages/modal-loteproducto/modal-loteproducto.component';
import { ListaComprasComponent } from './Pages/lista-compras/lista-compras.component';
import { ModaldetalleComprasComponent } from './Pages/modaldetalle-compras/modaldetalle-compras.component';
import { CreditoComprasComponent } from './Pages/credito-compras/credito-compras.component';
import { ModalpagocreditoCompraComponent } from './Pages/modalpagocredito-compra/modalpagocredito-compra.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { registerLocaleData } from '@angular/common';
import localeHN from '@angular/common/locales/es-HN';
import { ModaldetalleCreditocompraComponent } from './Pages/modaldetalle-creditocompra/modaldetalle-creditocompra.component';
import { PerfilEmpresaComponent } from './Pages/perfil-empresa/perfil-empresa.component';
import { ClienteComponent } from './Pages/cliente/cliente.component';
import { ModalClienteComponent } from './Pages/modal-cliente/modal-cliente.component';
import { CatalogoVentaComponent } from './Pages/catalogo-venta/catalogo-venta.component';
import { AddVentaComponent } from './Pages/add-venta/add-venta.component';
import { ListaVentaComponent } from './Pages/lista-venta/lista-venta.component';
import { CreditoVentaComponent } from './Pages/credito-venta/credito-venta.component';
import { ModalproductoVentaComponent } from './Pages/modalproducto-venta/modalproducto-venta.component';
import { ModaldetalleVentasComponent } from './Pages/modaldetalle-ventas/modaldetalle-ventas.component';
import { ModaldetalleCreditoventaComponent } from './Pages/modaldetalle-creditoventa/modaldetalle-creditoventa.component';
import { ModalpagocreditoVentaComponent } from './Pages/modalpagocredito-venta/modalpagocredito-venta.component';
import { DetalleBodegasComponent } from './Pages/detalle-bodegas/detalle-bodegas.component';
import { ModalmovimientoBodegaComponent } from './Pages/modalmovimiento-bodega/modalmovimiento-bodega.component';
import { CatalogoReportesComponent } from './Pages/catalogo-reportes/catalogo-reportes.component';
import { EgresosComponent } from './Pages/egresos/egresos.component';
import { IngresoComponent } from './Pages/ingreso/ingreso.component';
import { ModalInventarioComponent } from './Pages/modal-inventario/modal-inventario.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { LotesYProductosComponent } from './Pages/lotes-yproductos/lotes-yproductos.component';
import { ModalRebajarStokkComponent } from './Pages/modal-rebajar-stokk/modal-rebajar-stokk.component';
import { BitacoraComponent } from './Pages/bitacora/bitacora.component';
import { CotizarComponent } from './Pages/cotizar/cotizar.component';
import { CreditosClientesComponent } from './Pages/creditos-clientes/creditos-clientes.component';
import { TruequesComponent } from './Pages/trueques/trueques.component';
import { CreditoProveddordetalleComponent } from './Pages/credito-proveddordetalle/credito-proveddordetalle.component';

registerLocaleData(localeHN, 'es-HN');


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    WelcomeComponent,
     HomeComponent,
     UsuarioComponent,
     ModalUsuarioComponent,
     ModalclaveUsuarioComponent,
     ProveedorComponent,
     ModalProveedorComponent,
     CatalogoComponent,
     BodegasComponent,
     ModalBodegaComponent,
     UnidadComponent,
     UnidadModalComponent,
     CategoriaComponent,
     CategoriaModaComponent,
     LaboratorioComponent,
     LaboratorioModalComponent,
     PresentacionContenidoComponent,
     ModalPresentacionComponent,
     EditProductoComponent,
     CatalogoInventarioComponent,
     EditarProductoComponent,
     CatalogoComprasComponent,
     CrearCompraComponent,
     ModalproductoCompraComponent,
     ModalLoteproductoComponent,
     ListaComprasComponent,
     ModaldetalleComprasComponent,
     CreditoComprasComponent,
     ModalpagocreditoCompraComponent,
     ModaldetalleCreditocompraComponent,
     PerfilEmpresaComponent,
     ClienteComponent,
     ModalClienteComponent,
     CatalogoVentaComponent,
     AddVentaComponent,
     ListaVentaComponent,
     CreditoVentaComponent,
     ModalproductoVentaComponent,
     ModaldetalleVentasComponent,
     ModaldetalleCreditoventaComponent,
     ModalpagocreditoVentaComponent,
     DetalleBodegasComponent,
     ModalmovimientoBodegaComponent,
     CatalogoReportesComponent,
     EgresosComponent,
     IngresoComponent,
     ModalInventarioComponent,
     DashboardComponent,
     LotesYProductosComponent,
     ModalRebajarStokkComponent,
     BitacoraComponent,
     CotizarComponent,
     CreditosClientesComponent,
     TruequesComponent,
     CreditoProveddordetalleComponent,
   
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    MatDatepickerModule,
    MatTableModule,
    NgIf, 
    NgFor,
    HttpClientModule,
    FormsModule,
    MatNativeDateModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule, // Para [(ngModel)]
    ToastrModule.forRoot(),
    FullCalendarModule,
    MatBadgeModule,
    MatTooltipModule,
    LayoutModule,
    MatExpansionModule,
    MatMenuModule,
    MatGridListModule,
    NgxDatatableModule,
    MatAutocompleteModule,
    MatListModule,
    MatTabsModule,
    MatRadioModule,
    MatPaginatorModule,
    NgChartsModule,
    MatProgressSpinnerModule
   // NgxMatTimepickerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    
  { provide: LOCALE_ID, useValue: 'es-HN' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
