import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {CommonModule} from "@angular/common";
import {DestinosService} from "../../../../material-component/destinos/destinos.service";

@Component({
  selector: 'app-inf-destino',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inf-destino.component.html',
  styleUrls: ['./inf-destino.component.scss']
})
export class InfDestinoComponent implements OnInit {
  destino: any;

  constructor(
    private route: ActivatedRoute,
    private destinoService: DestinosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.destinoService.getById(+id).subscribe({
        next: data => this.destino = data,
        error: err => console.error('Error al cargar destino', err)
      });
    }
  }
}
