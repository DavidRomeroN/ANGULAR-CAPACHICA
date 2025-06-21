import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";

import { PublicComponent } from './public.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CarritoComponent } from './shared/navbar/Carrito/carrito.component';
import { ActividadesComponent } from "./components/actividades/actividades.component";

import { ComponentsModule } from './components/components.module';
import { ExamplesModule } from './examples/examples.module';
import { PublicRoutingModule } from './public.routing';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    PublicComponent,
    CarritoComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    RouterModule,
    ExamplesModule,
    PublicRoutingModule
  ],
  providers: [],
  exports: [
  ]
})
export class PublicModule { }
