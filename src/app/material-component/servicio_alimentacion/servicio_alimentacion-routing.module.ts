import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioAlimentacionComponent } from './servicio_alimentacion.component';

const routes: Routes = [{ path: '', component: ServicioAlimentacionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicioAlimentacionRoutingModule {}
