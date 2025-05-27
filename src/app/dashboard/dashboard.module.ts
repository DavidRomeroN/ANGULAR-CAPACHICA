import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { DashboardRoutes } from './dashboard.routing';

// ✅ Todos son standalone, así que van en imports:
import { DashboardComponent } from './dashboard.component';
import { BotonArtesaniaComponent } from './dashboard-components/botones-nuevos/boton-artesania/boton-artesania.component';
import { BotonHoteleriaComponent } from './dashboard-components/botones-nuevos/boton-hoteleria/boton-hoteleria.component';
import { BotonPaquetesComponent } from './dashboard-components/botones-nuevos/boton-paquetes/boton-paquetes.component';
import { BotonServicioComponent } from './dashboard-components/botones-nuevos/boton-servicio/boton-servicio.component';
import { BotonAlimentacionComponent } from './dashboard-components/botones-nuevos/boton-alimentacion/boton-alimentacion.component';

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    RouterModule.forChild(DashboardRoutes),

    // ✅ TODOS estos son standalone:
    DashboardComponent,
    BotonAlimentacionComponent,
    BotonArtesaniaComponent,
    BotonHoteleriaComponent,
    BotonPaquetesComponent,
    BotonServicioComponent,
    BotonAlimentacionComponent,
    BotonAlimentacionComponent,
  ]
})
export class DashboardModule {}
