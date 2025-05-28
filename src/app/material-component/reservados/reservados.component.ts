import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservadosService } from './reservados.service';

@Component({
  selector: 'app-reservados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservados.component.html',
  styleUrls: ['./reservados.component.scss']
})
export class ReservadosComponent implements OnInit {
  reservasPendientes: any[] = [];
  reservasHistorial: any[] = [];
  reservas: any[] = [];

  constructor(private reservadosService: ReservadosService) {}

  ngOnInit(): void {
    this.reservadosService.obtenerReservas().subscribe({
      next: data => {
        this.reservasPendientes = data
          .filter(r => r.estado === 'PENDIENTE')
          .sort((a, b) => b.idReserva - a.idReserva);

        this.reservasHistorial = data
          .filter(r => r.estado !== 'PENDIENTE')
          .sort((a, b) => b.idReserva - a.idReserva);
      },
      error: err => console.error('Error al obtener reservas', err)
    });
  }

  onEstadoChange(event: Event, reserva: any): void {
    const nuevoEstado = (event.target as HTMLSelectElement).value;
    this.cambiarEstado(reserva, nuevoEstado);
  }

  cambiarEstado(reserva: any, nuevoEstado: string): void {
    const reservaActualizada = {
      ...reserva,
      estado: nuevoEstado
    };

    this.reservadosService.actualizarEstadoCompleto(reservaActualizada).subscribe({
      next: () => {
        // Remover de pendientes si ya no está pendiente
        if (nuevoEstado !== 'PENDIENTE') {
          this.reservasPendientes = this.reservasPendientes.filter(r => r.idReserva !== reserva.idReserva);
          this.reservasHistorial.unshift({ ...reserva, estado: nuevoEstado }); // Añadir al historial
        } else {
          reserva.estado = nuevoEstado; // solo actualiza en lugar
        }
      },
      error: err => {
        console.error('Error al actualizar estado', err);
        alert('❌ No se pudo actualizar el estado');
      }
    });
  }
}

