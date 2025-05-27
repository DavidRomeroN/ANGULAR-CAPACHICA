import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearreservaService } from './crearreserva.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crearreserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crearreserva.component.html',
  styleUrls: ['./crearreserva.component.scss']
})
export class CrearreservaComponent implements OnInit {
  @Input() paqueteId!: number; // 👈 Este input lo recibirás del padre

  paquete: any;
  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';
  usuarioEmail = '';
  usuarioId = 0;
  mensajeError = '';

  constructor(private reservaService: CrearreservaService) {}

  ngOnInit(): void {
    // Obtenemos el paquete desde el input, no desde ActivatedRoute
    if (this.paqueteId) {
      this.reservaService.obtenerPaquetePorId(this.paqueteId).subscribe({
        next: data => {
          this.paquete = data;
          this.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : '';
          this.fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString().split('T')[0] : '';

        },
        error: err => console.error('Error al cargar paquete', err)
      });
    }

    const usuario = localStorage.getItem('usuarioLogueado');
    if (usuario) {
      const parsed = JSON.parse(usuario);
      this.usuarioEmail = parsed.email;
      this.usuarioId = parsed.idUsuario;
    }
  }

  confirmarReserva(): void {
    if (this.cantidadPersonas > this.paquete.cuposMaximos) {
      this.mensajeError = `❌ No hay suficientes cupos. Máximo permitido: ${this.paquete.cuposMaximos}`;
      return;
    }

    // Aseguramos el formato de fecha con hora
    const formatoFecha = (fecha: string) => fecha + 'T00:00:00';

    const reserva = {
      paquete: this.paqueteId,
      usuario: this.usuarioId,
      cantidadPersonas: this.cantidadPersonas,
      fechaInicio: formatoFecha(this.fechaInicio),
      fechaFin: formatoFecha(this.fechaFin),
      estado: 'PENDIENTE',
      observaciones: this.observaciones  // Se envía aunque sea cadena vacía
    };

    this.reservaService.crearReserva(reserva).subscribe({
      next: () => {
        alert('✅ Reserva realizada con éxito');
        this.mensajeError = '';
      },
      error: err => {
        console.error('Error al crear reserva', err);
        alert('❌ Error al crear la reserva');
      }
    });
  }

}
