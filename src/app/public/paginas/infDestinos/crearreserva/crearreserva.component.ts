import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';  // <-- Importar Output y EventEmitter
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
  @Input() paqueteId!: number;

  @Output() reservaExitosa = new EventEmitter<void>();  // <-- Declarar Output

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

    const formatoFecha = (fecha: string) => fecha + 'T00:00:00';

    const reserva = {
      paquete: this.paqueteId,
      usuario: this.usuarioId,
      cantidadPersonas: this.cantidadPersonas,
      fechaInicio: formatoFecha(this.fechaInicio),
      fechaFin: formatoFecha(this.fechaFin),
      estado: 'PENDIENTE',
      observaciones: this.observaciones
    };

    this.reservaService.crearReserva(reserva).subscribe({
      next: () => {
        alert('✅ Reserva realizada con éxito');
        this.mensajeError = '';
        this.recargarPaquete(); // Actualizar el paquete en este componente (opcional)
        this.reservaExitosa.emit();  // <-- Emitir el evento hacia el padre
      },
      error: err => {
        console.error('Error al crear reserva', err);
        alert('❌ Error al crear la reserva');
      }
    });
  }

  private recargarPaquete(): void {
    this.reservaService.obtenerPaquetePorId(this.paqueteId).subscribe({
      next: data => {
        this.paquete = data;
        this.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : '';
        this.fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString().split('T')[0] : '';
      },
      error: err => console.error('Error al recargar paquete', err)
    });
  }

}
