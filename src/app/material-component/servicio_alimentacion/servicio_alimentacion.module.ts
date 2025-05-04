import { DemoMaterialModule } from '../../demo-material-module';
import {ServicioAlimentacionComponent} from "./servicio_alimentacion.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ServicioAlimentacionRoutingModule} from "./servicio_alimentacion-routing.module";
import {NgModule} from "@angular/core"; // asegúrate de usar la ruta correcta

@NgModule({
  declarations: [ServicioAlimentacionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DemoMaterialModule,  // <--- aquí
    ServicioAlimentacionRoutingModule
  ]
})
export class ServicioAlimentacionModule {}
