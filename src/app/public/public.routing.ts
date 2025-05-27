import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PublicComponent } from './public.component';
import { ComponentsComponent } from './components/components.component';
import { LandingComponent } from './examples/landing/landing.component';
import { ProfileComponent } from './examples/profile/profile.component';
import { SignupComponent } from './examples/signup/signup.component';
import { NucleoiconsComponent } from './components/nucleoicons/nucleoicons.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import { DestinosComponent } from './components/destinos/destinos.component';

const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: ComponentsComponent }, // ✅ Asegurate de que esté así
      { path: 'landing', component: LandingComponent },
      { path: 'user-profile', component: ProfileComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'nucleoicons', component: NucleoiconsComponent },
      { path: 'paquetes', component: PaquetesComponent },
      { path: 'destinos', component: DestinosComponent },
      {
        path: 'detalle-destino/:id',
        loadComponent: () =>
          import('../public/paginas/infDestinos/inf-destino/inf-destino.component').then(m => m.InfDestinoComponent)
      }



    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
