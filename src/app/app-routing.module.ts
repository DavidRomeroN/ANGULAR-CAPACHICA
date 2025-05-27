import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'capachica',
    loadChildren: () =>
      import('./public/public.module').then(m => m.PublicModule) // ✅ esto carga PublicComponent con navbar/footer
  },



  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' // 👈 importante
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' // 👈 importante
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      { path: 'servicios', loadComponent: () => import('./material-component/servicios/servicios.component').then(m => m.ServiciosComponent) },
      { path: 'proveedores', loadComponent: () => import('./material-component/proveedores/proveedores.component').then(m => m.ProveedoresComponent) },
      { path: 'paquetes', loadComponent: () => import('./material-component/paquetes/paquetes.component').then(m => m.PaquetesComponent) },
      { path: 'servicio-hoteleria', loadComponent: () => import('./material-component/servicio-hoteleria/servicio-hoteleria.component').then(m => m.ServicioHoteleriaComponent) },
      { path: 'servicio-artesania', loadComponent: () => import('./material-component/servicio-artesania/servicio-artesania.component').then(m => m.ServicioArtesaniaComponent) },
      { path: 'servicio-alimento', loadComponent: () => import('./material-component/servicio_alimento/servicio-alimento.component').then(m => m.ServicioAlimentoComponent) },
      { path: 'destinos', loadComponent: () => import('./material-component/destinos/destinos.component').then(m => m.DestinosComponent) },
      { path: 'tipo-servicio', loadComponent: () => import('./material-component/tipo-servicio/tipo-servicio.component').then(m => m.TipoServicioComponent) },

// Carga el componente
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
      { path: 'slide-toggle', loadComponent: () => import('./material-component/slide-toggle/slide-toggle.component').then(m => m.SlideToggleComponent) },
      {
        path: 'reservas/crear/:id', loadComponent: () => import('./public/paginas/infDestinos/crearreserva/crearreserva.component').then(m => m.CrearreservaComponent)
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
