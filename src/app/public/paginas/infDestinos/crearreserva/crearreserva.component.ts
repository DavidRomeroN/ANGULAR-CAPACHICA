import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearreservaService } from './crearreserva.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crearreserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crearreserva.component.html',
  styleUrls: ['./crearreserva.component.scss']
})
export class CrearreservaComponent implements OnInit {
  @Input() paqueteId!: number;
  @Output() reservaExitosa = new EventEmitter<void>();

  paquete: any;
  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';
  usuarioEmail = '';
  usuarioId = 0;
  mensajeError = '';

  constructor(
      private reservaService: CrearreservaService,
      private router: Router
  ) {}

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

    Swal.fire({
      title: '¿Confirmar reserva?',
      text: 'Se enviará un mensaje por WhatsApp al proveedor.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.crearReservaYEnviarWhatsapp();
      }
    });
  }

  crearReservaYEnviarWhatsapp(): void {
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
        this.mensajeError = '';
        this.enviarMensajeWhatsapp();
        this.reservaExitosa.emit(); // Notifica al componente padre

        Swal.fire({
          icon: 'success',
          title: 'Reserva confirmada ✅',
          text: 'Serás redirigido al inicio...',
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/capachica/home']);
        }, 1800);

        this.recargarPaquete(); // Refresca el paquete si hace falta
      },
      error: err => {
        console.error('Error al crear reserva', err);
        alert('❌ Error al crear la reserva');
      }
    });
  }

  enviarMensajeWhatsapp(): void {
    const formatoFecha = (fechaStr: string): string => {
      const date = new Date(fechaStr);
      return `${date.getDate().toString().padStart(2, '0')}/${
          (date.getMonth() + 1).toString().padStart(2, '0')
      }/${date.getFullYear()}`;
    };

    const nombreProveedor = this.paquete.proveedor.nombreCompleto || 'Estimado/a';

    const mensaje = [
      `👋 Hola ${nombreProveedor}, acabo de realizar una reserva en tu paquete. Aquí están los detalles:`,
      '',
      '📢 *¡Reserva confirmada exitosamente!*',
      '',
      `📦 *Paquete:* ${this.paquete.titulo}`,
      `📍 *Localidad:* ${this.paquete.localidad}`,
      `🎯 *Actividad:* ${this.paquete.tipoActividad}`,
      `📅 *Fechas:* ${formatoFecha(this.fechaInicio)} al ${formatoFecha(this.fechaFin)}`,
      `👥 *Cantidad de personas:* ${this.cantidadPersonas}`,
      '',
      `👤 *Datos del usuario:*`,
      `📧 *Email:* ${this.usuarioEmail}`,
      '',
      `📝 *Observaciones:*`,
      `${this.observaciones || 'Sin observaciones'}`,
      '',
      '🤝 Gracias por confiar en nosotros. Estaremos encantados de atenderte.'
    ].join('\n');

    const mensajeCodificado = encodeURIComponent(mensaje);
    let telefonoProveedor = this.paquete.proveedor.telefono.trim();

    if (!telefonoProveedor.startsWith('+51')) {
      telefonoProveedor = '+51' + telefonoProveedor.replace(/^0+/, '').replace(/\D/g, '');
    } else {
      telefonoProveedor = telefonoProveedor.replace(/\D/g, '');
    }

    const url = `https://wa.me/${telefonoProveedor}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
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
