import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Pages/login/login.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './Pages/home/home.component';
import { UsuarioComponent } from './Pages/usuario/usuario.component';
import { ProveedorComponent } from './Pages/proveedor/proveedor.component';
import { CatalogoComponent } from './Pages/catalogo/catalogo.component';
import { BodegasComponent } from './Pages/bodegas/bodegas.component';
import { UnidadComponent } from './Pages/unidad/unidad.component';
import { CategoriaComponent } from './Pages/categoria/categoria.component';
import { LaboratorioComponent } from './Pages/laboratorio/laboratorio.component';
import { PresentacionContenidoComponent } from './Pages/presentacion-contenido/presentacion-contenido.component';
import { EditProductoComponent } from './Pages/add-producto/edit-producto.component';
import { CatalogoInventarioComponent } from './Pages/catalogo-inventario/catalogo-inventario.component';
import { EditarProductoComponent } from './Pages/editar-producto/editar-producto.component';
import { CatalogoComprasComponent } from './Pages/catalogo-compras/catalogo-compras.component';
import { CrearCompraComponent } from './Pages/crear-compra/crear-compra.component';
import { ListaComprasComponent } from './Pages/lista-compras/lista-compras.component';
import { CreditoComprasComponent } from './Pages/credito-compras/credito-compras.component';
import { PerfilEmpresaComponent } from './Pages/perfil-empresa/perfil-empresa.component';
import { ClienteComponent } from './Pages/cliente/cliente.component';
import { CatalogoVentaComponent } from './Pages/catalogo-venta/catalogo-venta.component';
import { AddVentaComponent } from './Pages/add-venta/add-venta.component';
import { ListaVentaComponent } from './Pages/lista-venta/lista-venta.component';
import { CreditoVentaComponent } from './Pages/credito-venta/credito-venta.component';
import { DetalleBodegasComponent } from './Pages/detalle-bodegas/detalle-bodegas.component';
import { EgresosComponent } from './Pages/egresos/egresos.component';
import { IngresoComponent } from './Pages/ingreso/ingreso.component';
import { CatalogoReportesComponent } from './Pages/catalogo-reportes/catalogo-reportes.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { LotesYProductosComponent } from './Pages/lotes-yproductos/lotes-yproductos.component';
import { BitacoraComponent } from './Pages/bitacora/bitacora.component';
import { CotizarComponent } from './Pages/cotizar/cotizar.component';
import { CreditosClientesComponent } from './Pages/creditos-clientes/creditos-clientes.component';
import { TruequesComponent } from './Pages/trueques/trueques.component';
import { CreditoProveddordetalleComponent } from './Pages/credito-proveddordetalle/credito-proveddordetalle.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'Trueque', component: TruequesComponent, canActivate: [AuthGuard] },
  { path: 'creditosventa', component: CreditosClientesComponent, canActivate: [AuthGuard] },
  { path: 'cotizar', component: CotizarComponent, canActivate: [AuthGuard] },
  { path: 'bitacora', component: BitacoraComponent, canActivate: [AuthGuard] },
  { path: 'lotes', component: LotesYProductosComponent, canActivate: [AuthGuard] },
  { path: 'dash', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'reportes', component: CatalogoReportesComponent, canActivate: [AuthGuard] },
  { path: 'ingreso', component: IngresoComponent, canActivate: [AuthGuard] },
  { path: 'egreso', component: EgresosComponent, canActivate: [AuthGuard] },
  { path: 'detalle_bodegas', component: DetalleBodegasComponent, canActivate: [AuthGuard] },
  { path: 'credito_compras/:id', component: CreditoProveddordetalleComponent, canActivate: [AuthGuard] },
  { path: 'credito_ventas/:id', component: CreditoVentaComponent, canActivate: [AuthGuard] },
  { path: 'lista_ventas', component: ListaVentaComponent, canActivate: [AuthGuard] },
  { path: 'add_venta', component: AddVentaComponent, canActivate: [AuthGuard] },
  { path: 'admin_ventas', component: CatalogoVentaComponent, canActivate: [AuthGuard] },
  { path: 'cliente', component: ClienteComponent, canActivate: [AuthGuard] },
  { path: 'empresa', component: PerfilEmpresaComponent, canActivate: [AuthGuard] },
  { path: 'credito_compras', component: CreditoComprasComponent, canActivate: [AuthGuard] },
  { path: 'lista_compras', component: ListaComprasComponent, canActivate: [AuthGuard] },
  { path: 'add_compras', component: CrearCompraComponent, canActivate: [AuthGuard] },
  { path: 'admin_compras', component: CatalogoComprasComponent, canActivate: [AuthGuard] },
  { path: 'editar_producto', component: EditarProductoComponent, canActivate: [AuthGuard] },
  { path: 'admin_inventario', component: CatalogoInventarioComponent, canActivate: [AuthGuard] },
  { path: 'addproducto', component: EditProductoComponent, canActivate: [AuthGuard] }, // esta es para agregar un producto
  { path: 'presentacion', component: PresentacionContenidoComponent, canActivate: [AuthGuard] },
  { path: 'laboratorio', component: LaboratorioComponent, canActivate: [AuthGuard] },
  { path: 'categoria', component: CategoriaComponent, canActivate: [AuthGuard] },
  { path: 'unidad', component: UnidadComponent, canActivate: [AuthGuard] },
  { path: 'bodega', component: BodegasComponent, canActivate: [AuthGuard] },
  { path: 'catalogo', component: CatalogoComponent, canActivate: [AuthGuard] },
  { path: 'proveedor', component: ProveedorComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UsuarioComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirige al login por defecto
  { path: '**', redirectTo: 'login' },  // Ruta comodín para rutas no encontradas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)
    
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
