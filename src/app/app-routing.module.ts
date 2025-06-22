import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // ========== REDIRECT INICIAL ==========
  {
    path: '',
    redirectTo: '/capachica',
    pathMatch: 'full'
  },

  // ========== RUTAS PÚBLICAS PRINCIPALES ==========
  {
    path: 'capachica',
    loadChildren: () =>
      import('./public/public.module').then(m => m.PublicModule)
  },

  // ========== RUTAS PÚBLICAS DIRECTAS (SIN AUTENTICACIÓN) ==========
  {
    path: 'public',
    children: [
      {
        path: 'destinos',
        loadComponent: () => import('./public/paginas/infDestinos/inf-destino/inf-destino.component').then(m => m.InfDestinoComponent)
      },
      {
        path: 'paquetes',
        loadComponent: () => import('./public/paginas/infDestinos/infPaquetes/inf-paquete/inf-paquete.component').then(m => m.InfPaqueteComponent)
      },
      {
        path: 'destino/:id',
        loadComponent: () => import('./public/paginas/infDestinos/inf-destino/inf-destino.component').then(m => m.InfDestinoComponent)
      },
      {
        path: 'paquete/:id',
        loadComponent: () => import('./public/paginas/infDestinos/infPaquetes/inf-paquete/inf-paquete.component').then(m => m.InfPaqueteComponent)
      },
      {
        path: 'artesania/:id',
        loadComponent: () => import('./public/paginas/infDestinos/infartesania/inf-artesania.component').then(m => m.InfArtesaniaComponent)
      }
    ]
  },

  // ========== RUTAS DIRECTAS PARA DETALLES ==========
  {
    path: 'artesania/:id',
    loadComponent: () => import('./public/paginas/infDestinos/infartesania/inf-artesania.component').then(m => m.InfArtesaniaComponent)
  },

  // ========== RUTAS PROTEGIDAS (ADMIN/GESTIÓN) ==========
  {
    path: 'admin',
    component: FullComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reservados', loadComponent: () => import('./material-component/reservados/reservados.component').then(m => m.ReservadosComponent) },
      { path: 'servicios', loadComponent: () => import('./material-component/servicios/servicios.component').then(m => m.ServiciosComponent) },
      { path: 'proveedores', loadComponent: () => import('./material-component/proveedores/proveedores.component').then(m => m.ProveedoresComponent) },
      { path: 'paquetes', loadComponent: () => import('./material-component/paquetes/paquetes.component').then(m => m.PaquetesComponent) },
      { path: 'servicio-hoteleria', loadComponent: () => import('./material-component/servicio-hoteleria/servicio-hoteleria.component').then(m => m.ServicioHoteleriaComponent) },
      { path: 'servicio-artesania', loadComponent: () => import('./material-component/servicio-artesania/servicio-artesania.component').then(m => m.ServicioArtesaniaComponent) },
      { path: 'servicio-alimento', loadComponent: () => import('./material-component/servicio_alimento/servicio-alimento.component').then(m => m.ServicioAlimentoComponent) },
      { path: 'destinos', loadComponent: () => import('./material-component/destinos/destinos.component').then(m => m.DestinosComponent) },
      { path: 'tipo-servicio', loadComponent: () => import('./material-component/tipo-servicio/tipo-servicio.component').then(m => m.TipoServicioComponent) },

      // Componentes Material
      { path: 'button', loadComponent: () => import('./material-component/buttons/buttons.component').then(m => m.ButtonsComponent) },
      { path: 'grid', loadComponent: () => import('./material-component/grid/grid.component').then(m => m.GridComponent) },
      { path: 'lists', loadComponent: () => import('./material-component/lists/lists.component').then(m => m.ListsComponent) },
      { path: 'menu', loadComponent: () => import('./material-component/menu/menu.component').then(m => m.MenuComponent) },
      { path: 'tabs', loadComponent: () => import('./material-component/tabs/tabs.component').then(m => m.TabsComponent) },
      { path: 'stepper', loadComponent: () => import('./material-component/stepper/stepper.component').then(m => m.StepperComponent) },
      { path: 'expansion', loadComponent: () => import('./material-component/expansion/expansion.component').then(m => m.ExpansionComponent) },
      { path: 'chips', loadComponent: () => import('./material-component/chips/chips.component').then(m => m.ChipsComponent) },
      { path: 'toolbar', loadComponent: () => import('./material-component/toolbar/toolbar.component').then(m => m.ToolbarComponent) },
      { path: 'progress-snipper', loadComponent: () => import('./material-component/progress-snipper/progress-snipper.component').then(m => m.ProgressSnipperComponent) },
      { path: 'progress', loadComponent: () => import('./material-component/progress/progress.component').then(m => m.ProgressComponent) },
      { path: 'dialog', loadComponent: () => import('./material-component/dialog/dialog.component').then(m => m.DialogComponent) },
      { path: 'tooltip', loadComponent: () => import('./material-component/tooltip/tooltip.component').then(m => m.TooltipComponent) },
      { path: 'snackbar', loadComponent: () => import('./material-component/snackbar/snackbar.component').then(m => m.SnackbarComponent) },
      { path: 'slider', loadComponent: () => import('./material-component/slider/slider.component').then(m => m.SliderComponent) },
      { path: 'slide-toggle', loadComponent: () => import('./material-component/slide-toggle/slide-toggle.component').then(m => m.SlideToggleComponent) }
    ]
  },

  // ========== RUTAS QUE REQUIEREN AUTENTICACIÓN PARA RESERVAS ==========
  {
    path: 'reservas',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'crear/:id',
        loadComponent: () => import('./public/paginas/infDestinos/crearreserva/crearreserva.component').then(m => m.CrearreservaComponent)
      },
      {
        path: 'mis-reservas',
        loadComponent: () => import('./material-component/reservados/reservados.component').then(m => m.ReservadosComponent)
      }
    ]
  },

  // ========== AUTENTICACIÓN ==========
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule)
  },

  // ========== OAUTH2 CALLBACK - AGREGAR ESTAS RUTAS ==========
  {
    path: 'auth/oauth2/callback',
    loadComponent: () => import('./components/oauth2-callback/oauth2-callback.component').then(m => m.OAuth2CallbackComponent)
  },
  {
    path: 'auth/error',
    loadComponent: () => import('./components/oauth2-callback/oauth2-callback.component').then(m => m.OAuth2CallbackComponent)
  },

  // ========== REDIRECTS ==========
  {
    path: '**',
    redirectTo: '/capachica'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Cambiar a true solo para debug
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
