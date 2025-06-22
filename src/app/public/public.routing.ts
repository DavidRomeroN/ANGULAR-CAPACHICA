import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PublicComponent } from './public.component';
import { ComponentsComponent } from './components/components.component';
import { LandingComponent } from './examples/landing/landing.component';
import { ProfileComponent } from './examples/profile/profile.component';
import { SignupComponent } from './examples/signup/signup.component';
import { NucleoiconsComponent } from './components/nucleoicons/nucleoicons.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import {DestinosComponent} from "../material-component/destinos/destinos.component";
import {ArtesaniasComponent} from "./components/artesania/artesanias.component";
import {HoteleriaComponent} from "./components/hoteles/hoteles.component";

const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: ComponentsComponent },
      { path: 'landing', component: LandingComponent },
      { path: 'user-profile', component: ProfileComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'nucleoicons', component: NucleoiconsComponent },
      { path: 'paquetes', component: PaquetesComponent },
      { path: 'destinos', component: DestinosComponent },
      { path: 'artesanias', component: ArtesaniasComponent},
      { path: 'hoteles', component: HoteleriaComponent},
      // Mantener esta ruta para la lista

      // ========== RUTAS DE DETALLE ==========
      {
        path: 'detalle-destino/:id',
        loadComponent: () =>
          import('../public/paginas/infDestinos/inf-destino/inf-destino.component').then(m => m.InfDestinoComponent)
      },
      {
        path: 'detalle-paquete/:id',
        loadComponent: () =>
          import('../public/paginas/infDestinos/infPaquetes/inf-paquete/inf-paquete.component')
            .then(m => m.InfPaqueteComponent)
      },

      // ✅ CORREGIDO: Cambiar nombre del componente
      {
        path: 'detalle-actividad/:id',
        loadComponent: () =>
          import('./paginas/infDestinos/infActividad/inf-actividad.component')
            .then(m => m.InfActividadComponent) // Cambiado de ActividadesComponent a InfActividadComponent
      },

      // ✅ CORREGIDO: Cambiar nombre de ruta para evitar duplicados
      {
        path: 'detalle-artesania/:id',  // Cambiado de 'artesanias' a 'detalle-artesania'
        loadComponent: () =>
          import('../public/paginas/infDestinos/infartesania/inf-artesania.component').then(m => m.InfArtesaniaComponent)
      },
      {
        path: 'detalle-hotel/:id',  // Cambiado de 'artesanias' a 'detalle-artesania'
        loadComponent: () =>
          import('../public/paginas/infDestinos/infhoteleria/inf-hoteleria.component').then(m => m.InfHotelComponent)
      },

      // ========== RUTAS DE RESERVAS ==========
      {
        path: 'reservas/crear/:id',
        loadComponent: () =>
          import('../public/paginas/infDestinos/crearreserva/crearreserva.component')
            .then(m => m.CrearreservaComponent)
      },

      // ========== RUTAS ADICIONALES PARA USAR EL COMPONENTE UNIFICADO ==========

      // Ruta alternativa para paquetes usando el componente unificado
      {
        path: 'paquetedetalle/:id',
        loadComponent: () =>
          import('../public/paginas/infDestinos/infPaquetes/inf-paquete/inf-paquete.component')
            .then(m => m.InfPaqueteComponent)
      },

      // Ruta alternativa para actividades usando el componente unificado
      {
        path: 'actividaddetalle/:id',
        loadComponent: () =>
          import('./paginas/infDestinos/infActividad/inf-actividad.component')
            .then(m => m.InfActividadComponent)
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
