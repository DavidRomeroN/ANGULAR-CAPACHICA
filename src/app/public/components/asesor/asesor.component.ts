import { Component, OnInit } from '@angular/core';
import {AsesorService} from "./asesor.service";

@Component({
  selector: 'app-asesor',
  templateUrl: './asesor.component.html',
  styleUrls: ['./asesor.component.scss']
})
export class AsesorComponent implements OnInit {

  mensajeIA: string = '';
  actividades: any[] = [];
  clima: any = {};

  constructor(private asesorService: AsesorService) {}

  ngOnInit(): void {
    this.asesorService.obtenerRecomendaciones(0).subscribe((data: any) => {
      this.mensajeIA = data.mensajeIA;
      this.actividades = data.actividades;
      this.clima = data.clima;
    });
  }
}
