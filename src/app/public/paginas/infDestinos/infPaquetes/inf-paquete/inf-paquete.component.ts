import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaquetesService } from 'src/app/material-component/paquetes/paquetes.service';
import { CrearreservaService } from '../../crearreserva/crearreserva.service';
import { FormsModule } from '@angular/forms';
import {CrearreservaComponent} from "../../crearreserva/crearreserva.component";

@Component({
  selector: 'app-inf-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule,  CrearreservaComponent],
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

  constructor(
    private route: ActivatedRoute,
    private paquetesService: PaquetesService,
    private reservaService: CrearreservaService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paquetesService.getById(+id).subscribe({
        next: data => this.paquete = data,
        error: err => console.error('Error al cargar paquete', err)
      });
    }
  }

  mostrarReserva(): void {
    this.mostrarFormulario = true;
  }

  confirmarReserva(): void {
    const reserva = {
      paquete: this.paquete.id ?? this.paquete.idPaquete,
      usuario: 60, // TODO: reemplazar con el ID real del usuario autenticado
      cantidadPersonas: this.cantidadPersonas,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      estado: 'PENDIENTE',
      observaciones: this.observaciones
    };

    this.reservaService.crearReserva(reserva).subscribe({
      next: () => {
        alert('✅ Reserva realizada con éxito');
        this.mostrarFormulario = false;
      },
      error: err => {
        console.error('Error al crear reserva', err);
        alert('❌ Error al crear la reserva');
      }
    });
  }
}
