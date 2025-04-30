import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
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
