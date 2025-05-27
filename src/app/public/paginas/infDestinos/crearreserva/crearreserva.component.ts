import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CrearreservaService } from './crearreserva.service';

@Component({
  selector: 'app-crearreserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crearreserva.component.html',
  styleUrls: ['./crearreserva.component.scss']
})
export class CrearreservaComponent implements OnInit {
  paquete: any;
  cantidadPersonas: number = 1;
  fechaReserva: string = '';

  constructor(
    private route: ActivatedRoute,
    private reservaService: CrearreservaService
  ) {}

  ngOnInit(): void {
    const paqueteId = this.route.snapshot.paramMap.get('id');
    if (paqueteId) {
      this.reservaService.obtenerPaquetePorId(+paqueteId).subscribe({
        next: data => this.paquete = data,
        error: err => console.error('Error al cargar paquete', err)
      });
    }
  }

  confirmarReserva(): void {
    const reserva = {
      paqueteId: this.paquete.id,
      usuarioId: 60, // Reemplazar por ID real del usuario autenticado
      cantidadPersonas: this.cantidadPersonas,
      fechaReserva: this.fechaReserva
    };

    this.reservaService.crearReserva(reserva).subscribe({
      next: () => alert('Reserva realizada con Ã©xito'),
      error: err => {
        console.error('Error al realizar reserva', err);
        alert('Hubo un error al crear la reserva');
      }
    });
  }
}
