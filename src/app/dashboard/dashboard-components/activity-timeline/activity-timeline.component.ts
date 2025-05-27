import { Component, OnInit } from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import {Resena} from "../../../material-component/resenas/resena.model";
import {ResenaService} from "../../../material-component/resenas/resena.service";

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule, DemoMaterialModule, NgIf, NgFor],
  templateUrl: './activity-timeline.component.html'

})
export class ActivityTimelineComponent implements OnInit {
  activityData: Resena[] = [];
  verTodo = false;
  ordenSeleccionado: 'recientes' | 'mejor' | 'peor' = 'recientes';

  resenasOrdenadas() {
    return this.activityData.slice().sort((a, b) => {
      switch (this.ordenSeleccionado) {
        case 'mejor':
          return b.calificacion - a.calificacion;
        case 'peor':
          return a.calificacion - b.calificacion;
        case 'recientes':
        default:
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
    });
  }
  constructor(private resenaService: ResenaService) {}

  ngOnInit(): void {
    this.resenaService.getResenas().subscribe((data) => {
      this.activityData = data;
    });
  }
}
