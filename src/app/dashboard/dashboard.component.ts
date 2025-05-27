import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { SalesOverviewComponent } from './dashboard-components/sales-overview/sales-overview.component';
import { ContactsComponent } from './dashboard-components/contacts/contacts.component';
import { ProfileComponent } from './dashboard-components/profile/profile.component';
import { ActivityTimelineComponent } from './dashboard-components/activity-timeline/activity-timeline.component';

// 👇 Importa los botones
import { BotonAlimentacionComponent } from './dashboard-components/botones-nuevos/boton-alimentacion/boton-alimentacion.component';
import { BotonArtesaniaComponent } from './dashboard-components/botones-nuevos/boton-artesania/boton-artesania.component';
import { BotonHoteleriaComponent } from './dashboard-components/botones-nuevos/boton-hoteleria/boton-hoteleria.component';
import { BotonPaquetesComponent } from './dashboard-components/botones-nuevos/boton-paquetes/boton-paquetes.component';
import { BotonServicioComponent } from './dashboard-components/botones-nuevos/boton-servicio/boton-servicio.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    DemoMaterialModule,
    SalesOverviewComponent,
    ContactsComponent,
    ProfileComponent,
    ActivityTimelineComponent,

    // 👇 Importa aquí los nuevos botones
    BotonAlimentacionComponent,
    BotonArtesaniaComponent,
    BotonHoteleriaComponent,
    BotonPaquetesComponent,
    BotonServicioComponent
  ]
})
export class DashboardComponent {}
