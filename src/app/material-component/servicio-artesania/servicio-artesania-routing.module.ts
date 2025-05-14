import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioArtesaniaComponent } from './servicio-artesania.component';

const routes: Routes = [
  { path: '', component: ServicioArtesaniaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicioArtesaniaRoutingModule {}
