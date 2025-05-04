import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicioArtesaniaComponent } from './servicio_artesania.component';
import { ServicioArtesaniaRoutingModule } from './servicio_artesania-routing.module';
import { DemoMaterialModule } from '../../demo-material-module';

@NgModule({
  declarations: [ServicioArtesaniaComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DemoMaterialModule,
    ServicioArtesaniaRoutingModule
  ]
})
export class ServicioArtesaniaModule {}
