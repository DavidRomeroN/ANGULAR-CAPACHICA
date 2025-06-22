import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BasicelementsComponent } from './basicelements/basicelements.component';
import { NavigationComponent } from './navigation/navigation.component';
import { TypographyComponent } from './typography/typography.component';
import { NucleoiconsComponent } from './nucleoicons/nucleoicons.component';
import { ComponentsComponent } from './components.component';
import { NotificationComponent } from './notification/notification.component';
import { NgbdModalComponent } from './modal/modal.component';
import { NgbdModalContent } from './modal/modal.component';
import { DestinosComponent } from './destinos/destinos.component';
import { PaquetesComponent } from './paquetes/paquetes.component';
import {ServicioArtesaniaComponent} from "../../material-component/servicio-artesania/servicio-artesania.component";
import {InfArtesaniaComponent} from "../paginas/infDestinos/infartesania/inf-artesania.component";
import {ArtesaniasComponent} from "./artesania/artesanias.component";
import {PublicModule} from "../public.module";
import {ActividadesComponent} from "./actividades/actividades.component";
import {HoteleriaComponent} from "./hoteles/hoteles.component";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule,
    ServicioArtesaniaComponent,
    InfArtesaniaComponent,
    ArtesaniasComponent,

    PublicModule,
    HoteleriaComponent
  ],
    declarations: [
        ComponentsComponent,
        BasicelementsComponent,
        NavigationComponent,
        TypographyComponent,
        NucleoiconsComponent,
        NotificationComponent,
        NgbdModalComponent,
        NgbdModalContent,
        DestinosComponent,
        PaquetesComponent,
        ActividadesComponent,
    ],
    exports:[ ComponentsComponent ]
})
export class ComponentsModule { }
