// src/app/material-component/material-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ButtonsComponent } from './buttons/buttons.component';
import { GridComponent } from './grid/grid.component';
import { ListsComponent } from './lists/lists.component';
import { MenuComponent } from './menu/menu.component';
import { TabsComponent } from './tabs/tabs.component';
import { StepperComponent } from './stepper/stepper.component';
import { ExpansionComponent } from './expansion/expansion.component';
import { ChipsComponent } from './chips/chips.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ProgressSnipperComponent } from './progress-snipper/progress-snipper.component';
import { ProgressComponent } from './progress/progress.component';
import { DialogComponent } from './dialog/dialog.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { SliderComponent } from './slider/slider.component';
import { SlideToggleComponent } from './slide-toggle/slide-toggle.component';
import {ServiciosComponent} from "./servicios/servicios.component";
import {ServicioAlimentoComponent} from "./servicio_alimento/servicio-alimento.component";


const routes: Routes = [
  { path: 'button', component: ButtonsComponent },
  { path: 'grid', component: GridComponent },
  { path: 'lists', component: ListsComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'tabs', component: TabsComponent },
  { path: 'stepper', component: StepperComponent },
  { path: 'expansion', component: ExpansionComponent },
  { path: 'chips', component: ChipsComponent },
  { path: 'toolbar', component: ToolbarComponent },
  { path: 'progress-snipper', component: ProgressSnipperComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'dialog', component: DialogComponent },
  { path: 'tooltip', component: TooltipComponent },
  { path: 'snackbar', component: SnackbarComponent },
  { path: 'slider', component: SliderComponent },
  { path: 'slide-toggle', component: SlideToggleComponent },
  {path: 'servicios', component: ServiciosComponent},
  {path: 'proveedores', component: ServiciosComponent},
  { path: 'servicio-alimento', component: ServicioAlimentoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialRoutingModule {}
