import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservadosService } from './reservados.service';
import emailjs from '@emailjs/browser';

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

  constructor(private reservadosService: ReservadosService) {}

  ngOnInit(): void {
    this.reservadosService.obtenerReservas().subscribe({
      next: (data: any[]) => {
        this.reservasPendientes = data
          .filter(r => r.estado === 'PENDIENTE')
          .sort((a, b) => b.idReserva - a.idReserva);

        this.reservasHistorial = data
          .filter(r => r.estado !== 'PENDIENTE')
          .sort((a, b) => b.idReserva - a.idReserva);
      },
      error: (err: any) => console.error('Error al obtener reservas', err)
    });
  }

  onEstadoChange(event: Event, reserva: any): void {
    const nuevoEstado = (event.target as HTMLSelectElement).value;
    this.cambiarEstado(reserva, nuevoEstado);
  }

  cambiarEstado(reserva: any, nuevoEstado: string): void {
    const dtoCompleto = {
      idReserva: reserva.idReserva || reserva.id,  // por si llega con nombre distinto
      fechaInicio: reserva.fechaInicio,
      fechaFin: reserva.fechaFin,
      estado: nuevoEstado,
      cantidadPersonas: reserva.cantidadPersonas,
      observaciones: reserva.observaciones || '',
      usuario: reserva.usuario.idUsuario,
      paquete: reserva.paquete.idPaquete
    };

    this.reservadosService.actualizarReserva(dtoCompleto, dtoCompleto.idReserva).subscribe({
      next: () => {
        reserva.estado = nuevoEstado;
        this.enviarCorreoConfirmacion(reserva);  // si quieres que mande email también
      },
      error: (err) => {
        console.error('Error al actualizar reserva completa', err);
        alert('❌ No se pudo actualizar el estado');
      }
    });
  }


  enviarCorreoConfirmacion(reserva: any): void {
    const templateParams = {
      to_email: reserva.usuario.email,
      title: 'Confirmación de Reserva', // <-- Añadir esto
      paquete: reserva.paquete.titulo,
      localidad: reserva.paquete.localidad,
      actividad: reserva.paquete.tipoActividad,
      proveedor: reserva.paquete.proveedor?.nombre || 'Proveedor',
      fechaInicio: new Date(reserva.fechaInicio).toLocaleDateString(),
      fechaFin: new Date(reserva.fechaFin).toLocaleDateString(),
      cantidadPersonas: reserva.cantidadPersonas,
      observaciones: reserva.observaciones || 'Sin observaciones'
    };


    emailjs.send('service_sqe74s8', 'template_zppae2o', templateParams, 'u83TIyZy3DBAlS0L_')
      .then((response: any) => {
        console.log('✅ Correo enviado:', response.status, response.text);
      }, (error: any) => {
        console.error('❌ Error al enviar correo:', error);
      });
  }
}
