
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

import { PublicComponent } from './public.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

import { ComponentsModule } from './components/components.module';
import { ExamplesModule } from './examples/examples.module';
import {CommonModule} from "@angular/common";
import { PublicRoutingModule } from './public.routing';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    PublicComponent
  ],
  imports: [
    NgbModule,
    FormsModule,
    RouterModule,
    ComponentsModule,
    ExamplesModule,
    CommonModule,
    RouterModule,
    PublicRoutingModule
  ],
  providers: [],
})
export class PublicModule { }
