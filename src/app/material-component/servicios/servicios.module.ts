import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiciosComponent } from './servicios.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {DemoMaterialModule} from "../../demo-material-module";

const routes: Routes = [
  { path: '', component: ServiciosComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    DemoMaterialModule
  ]
})
export class ServiciosModule {}
