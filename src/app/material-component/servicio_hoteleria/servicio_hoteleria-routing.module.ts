import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioHoteleriaComponent } from './servicio_hoteleria.component';

const routes: Routes = [{ path: '', component: ServicioHoteleriaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicioHoteleriaRoutingModule {}
