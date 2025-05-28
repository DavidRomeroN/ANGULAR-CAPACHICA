import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaquetesService } from 'src/app/material-component/paquetes/paquetes.service';
import { CrearreservaService } from '../../crearreserva/crearreserva.service';
import { FormsModule } from '@angular/forms';
import { CrearreservaComponent } from "../../crearreserva/crearreserva.component";

@Component({
  selector: 'app-inf-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearreservaComponent],
  templateUrl: './inf-paquete.component.html',
  styleUrls: ['./inf-paquete.component.scss']
})
export class InfPaqueteComponent implements OnInit {
  paquete: any;
  mostrarFormulario = false;

  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';

  paqueteId!: number;

  constructor(
    private route: ActivatedRoute,
    private paquetesService: PaquetesService,
    private reservaService: CrearreservaService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paqueteId = +id;
      this.cargarPaquete(this.paqueteId);
    }
  }

  cargarPaquete(id: number): void {
    this.paquetesService.getById(id).subscribe({
      next: data => this.paquete = data,
      error: err => console.error('Error al cargar paquete', err)
    });
  }

  mostrarReserva(): void {
    this.mostrarFormulario = true;
  }

  // Este método lo llamamos cuando el hijo emita que la reserva fue exitosa
  onReservaExitosa(): void {
    this.mostrarFormulario = false;
    const id = this.paquete.id ?? this.paquete.idPaquete;
    this.paquetesService.getById(id).subscribe({
      next: data => this.paquete = data,
      error: err => console.error('Error al recargar paquete', err)
    });
  }

}
