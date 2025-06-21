import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CrearreservaService} from './crearreserva.service';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-crearreserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crearreserva.component.html',
  styleUrls: ['./crearreserva.component.scss']
})
export class CrearreservaComponent implements OnInit {
  // Inputs para ambos tipos
  @Input() paqueteId?: number;
  @Input() actividadId?: number;
  @Input() tipoReserva: 'PAQUETE' | 'ACTIVIDAD' = 'PAQUETE';

  // Outputs
  @Output() reservaExitosa = new EventEmitter<void>();
  @Output() volverAlPaquete = new EventEmitter<void>();

  // Datos del item (paquete o actividad)
  paquete: any;
  actividad: any;

  // Formulario
  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';
  usuarioEmail = '';
  usuarioId = 0;
  mensajeError = '';

  // Control del estado de la reserva
  reservaCompletada: boolean = false;
  reservaRealizada: any = null;

  constructor(
    private reservaService: CrearreservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Iniciando componente con:', {
      paqueteId: this.paqueteId,
      actividadId: this.actividadId,
      tipoReserva: this.tipoReserva
    });

    if (this.paqueteId) {
      this.tipoReserva = 'PAQUETE';
      this.cargarPaquete();
    } else if (this.actividadId) {
      this.tipoReserva = 'ACTIVIDAD';
      this.cargarActividad();
    }

    this.cargarUsuario();
  }

  private cargarPaquete(): void {
    this.reservaService.obtenerPaquetePorId(this.paqueteId!).subscribe({
      next: data => {
        console.log('Paquete cargado:', data);
        this.paquete = data;

        if (!this.paquete.proveedor?.telefono) {
          console.warn('⚠️ El paquete no tiene número de teléfono del proveedor');
        }

        this.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : '';
        this.fechaFin = data.fechaFin ? new Date(data.fechaFin).toISOString().split('T')[0] : '';
      },
      error: err => {
        console.error('Error al cargar paquete:', err);
        this.mensajeError = 'Error al cargar la información del paquete';
      }
    });
  }

  private cargarActividad(): void {
    this.reservaService.obtenerActividadPorId(this.actividadId!).subscribe({
      next: data => {
        console.log('Actividad cargada:', data);
        this.actividad = data;

        if (!this.actividad.proveedor?.telefono) {
          console.warn('⚠️ La actividad no tiene número de teléfono del proveedor');
        }

        // Para actividades, las fechas las define el usuario
        const hoy = new Date();
        this.fechaInicio = hoy.toISOString().split('T')[0];

        // Fecha fin por defecto (mismo día para actividades de pocas horas)
        if (this.actividad.duracionHoras <= 12) {
          this.fechaFin = this.fechaInicio;
        } else {
          // Para actividades de más de 12 horas, agregar un día
          const manana = new Date(hoy);
          manana.setDate(manana.getDate() + 1);
          this.fechaFin = manana.toISOString().split('T')[0];
        }
      },
      error: err => {
        console.error('Error al cargar actividad:', err);
        this.mensajeError = 'Error al cargar la información de la actividad';
      }
    });
  }

  private cargarUsuario(): void {
    const usuario = localStorage.getItem('usuarioLogueado');
    if (usuario) {
      try {
        const parsed = JSON.parse(usuario);
        this.usuarioEmail = parsed.email;
        this.usuarioId = parsed.idUsuario;
        console.log('Usuario cargado:', this.usuarioEmail);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
  }

  confirmarReserva(): void {
    // Validaciones específicas por tipo
    if (this.tipoReserva === 'PAQUETE') {
      if (this.cantidadPersonas > this.paquete.cuposMaximos) {
        this.mensajeError = `❌ No hay suficientes cupos. Máximo permitido: ${this.paquete.cuposMaximos}`;
        return;
      }
    } else {
      // Para actividades, validar límites razonables
      if (this.cantidadPersonas > 20) {
        this.mensajeError = `❌ Máximo 20 personas por actividad`;
        return;
      }
    }

    if (!this.observaciones.trim()) {
      this.mensajeError = '❌ Las observaciones son obligatorias';
      return;
    }

    if (!this.fechaInicio || !this.fechaFin) {
      this.mensajeError = '❌ Las fechas son obligatorias';
      return;
    }

    const formatoFecha = (fecha: string) => fecha + 'T00:00:00';

    const reserva = this.tipoReserva === 'PAQUETE' ? {
      paquete: this.paqueteId,
      usuario: this.usuarioId,
      cantidadPersonas: this.cantidadPersonas,
      fechaInicio: formatoFecha(this.fechaInicio),
      fechaFin: formatoFecha(this.fechaFin),
      estado: 'PENDIENTE',
      observaciones: this.observaciones,
      tipoReserva: 'PAQUETE'
    } : {
      actividad: this.actividadId,
      usuario: this.usuarioId,
      cantidadPersonas: this.cantidadPersonas,
      fechaInicio: formatoFecha(this.fechaInicio),
      fechaFin: formatoFecha(this.fechaFin),
      estado: 'PENDIENTE',
      observaciones: this.observaciones,
      tipoReserva: 'ACTIVIDAD'
    };

    console.log('Enviando reserva:', reserva);

    this.reservaService.crearReserva(reserva).subscribe({
      next: (response) => {
        console.log('Reserva creada exitosamente:', response);

        let reservaId: number;
        if (response && response.id) {
          reservaId = response.id;
        } else {
          reservaId = Date.now();
          console.warn('⚠️ La respuesta del servidor no contiene ID, usando ID temporal:', reservaId);
        }

        this.reservaRealizada = {
          ...reserva,
          id: reservaId,
          fechaCreacion: new Date()
        };

        this.reservaCompletada = true;
        this.mensajeError = '';

        alert(`✅ Reserva de ${this.tipoReserva.toLowerCase()} realizada con éxito`);
        this.recargarItem();
        this.reservaExitosa.emit();
      },
      error: err => {
        console.error('Error al crear reserva:', err);
        this.mensajeError = '❌ Error al crear la reserva. Intenta nuevamente.';
        alert('❌ Error al crear la reserva');
      }
    });
  }

  contactarPorWhatsApp(): void {
    console.log('Intentando contactar por WhatsApp...');

    const item = this.tipoReserva === 'PAQUETE' ? this.paquete : this.actividad;
    console.log('Datos del item:', item);

    if (!item?.proveedor?.telefono) {
      console.error('No se encontró teléfono del proveedor');
      alert('❌ No se encontró número de teléfono del proveedor. Contacta al administrador.');
      return;
    }

    let numeroTelefono = item.proveedor.telefono.toString().replace(/[^\d]/g, '');

    if (!numeroTelefono.startsWith('51') && numeroTelefono.length === 9) {
      numeroTelefono = '51' + numeroTelefono;
    }

    const mensaje = this.crearMensajeWhatsApp();
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;

    try {
      const ventanaWhatsApp = window.open(whatsappUrl, '_blank', 'width=800,height=600');

      if (!ventanaWhatsApp || ventanaWhatsApp.closed || typeof ventanaWhatsApp.closed == 'undefined') {
        this.mostrarAlternativaWhatsApp(numeroTelefono, mensaje);
      } else {
        setTimeout(() => {
          alert('📱 Redirigiendo a WhatsApp...');
        }, 1000);
      }
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      this.mostrarAlternativaWhatsApp(numeroTelefono, mensaje);
    }
  }

  private crearMensajeWhatsApp(): string {
    const fechaFormateada = (fecha: string) => {
      if (!fecha) return 'No especificada';
      const fechaObj = new Date(fecha + 'T00:00:00');
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const item = this.tipoReserva === 'PAQUETE' ? this.paquete : this.actividad;
    const nombre = item?.proveedor?.nombreCompleto || 'estimado proveedor';
    const titulo = this.tipoReserva === 'PAQUETE' ? item?.titulo : item?.titulo;
    const precio = this.tipoReserva === 'PAQUETE' ? item?.precioTotal : item?.precioBase;

    if (this.tipoReserva === 'PAQUETE') {
      return `Hola ${nombre}! 👋

Acabo de realizar una reserva para tu paquete turistico y me gustaria coordinar los detalles.

*DETALLES DE MI RESERVA:*

🏷 *Paquete:* ${titulo}
📅 *Fechas:* ${fechaFormateada(this.fechaInicio)} al ${fechaFormateada(this.fechaFin)}
👥 *Personas:* ${this.cantidadPersonas}
💰 *Total:* S/. ${this.totalCalculado.toFixed(2)}
📧 *Mi email:* ${this.usuarioEmail}

📝 *Observaciones:*
${this.observaciones || 'Ninguna observacion especial'}

Me gustaria coordinar:
✅ Confirmacion de disponibilidad
✅ Detalles del itinerario
✅ Punto de encuentro
✅ Metodo de pago
✅ Informacion adicional necesaria

Quedo atento a tu respuesta! 😊

_Mensaje enviado desde el sistema de reservas_`;
    } else {
      return `Hola ${nombre}! 👋

Acabo de realizar una reserva para tu actividad y me gustaria coordinar los detalles.

*DETALLES DE MI RESERVA:*

🎯 *Actividad:* ${titulo}
📅 *Fechas:* ${fechaFormateada(this.fechaInicio)} al ${fechaFormateada(this.fechaFin)}
👥 *Personas:* ${this.cantidadPersonas}
⏰ *Duración:* ${item?.duracionHoras || 0} horas
💰 *Total:* S/. ${this.totalCalculado.toFixed(2)}
📧 *Mi email:* ${this.usuarioEmail}

📝 *Observaciones:*
${this.observaciones || 'Ninguna observacion especial'}

Me gustaria coordinar:
✅ Confirmacion de disponibilidad
✅ Punto de encuentro
✅ Que incluye la actividad
✅ Que debo llevar
✅ Metodo de pago

Quedo atento a tu respuesta! 😊

_Mensaje enviado desde el sistema de reservas_`;
    }
  }

  private mostrarAlternativaWhatsApp(numeroTelefono: string, mensaje: string): void {
    const modalHtml = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; max-height: 90%; overflow-y: auto;">
        <h3 style="color: #25d366; margin-bottom: 1rem;">📱 Contactar por WhatsApp</h3>
        <p style="margin-bottom: 1rem;">No se pudo abrir WhatsApp automáticamente. Puedes:</p>

        <div style="margin-bottom: 1rem;">
          <strong>Opción 1:</strong> Llamar directamente<br>
          <a href="tel:+${numeroTelefono}" style="color: #25d366; font-size: 1.2rem; text-decoration: none;">
            📞 +${numeroTelefono}
          </a>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong>Opción 2:</strong> Copiar número
          <button onclick="navigator.clipboard.writeText('+${numeroTelefono}').then(() => alert('Número copiado!'))"
                  style="margin-left: 10px; padding: 5px 10px; background: #25d366; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📋 Copiar
          </button>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong>Opción 3:</strong> Abrir WhatsApp Web<br>
          <a href="https://web.whatsapp.com/send?phone=${numeroTelefono}&text=${encodeURIComponent(mensaje)}"
             target="_blank" style="color: #25d366; text-decoration: none;">
            🌐 WhatsApp Web
          </a>
        </div>

        <button onclick="this.parentElement.parentElement.remove()"
                style="width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Getters adaptativos
  get itemActual(): any {
    return this.tipoReserva === 'PAQUETE' ? this.paquete : this.actividad;
  }

  get tituloItem(): string {
    return this.tipoReserva === 'PAQUETE' ?
      (this.paquete?.titulo || '') :
      (this.actividad?.titulo || '');
  }

  get limitePersonas(): number {
    return this.tipoReserva === 'PAQUETE' ?
      (this.paquete?.cuposMaximos || 20) :
      20; // Límite por defecto para actividades
  }

  get totalCalculado(): number {
    if (this.tipoReserva === 'PAQUETE') {
      return this.paquete ? (this.paquete.precioTotal * this.cantidadPersonas) : 0;
    } else {
      return this.actividad ? (this.actividad.precioBase * this.cantidadPersonas) : 0;
    }
  }

  // Método auxiliar para formatear fechas
  public formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha + 'T00:00:00');
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get fechaInicioFormateada(): string {
    return this.formatearFecha(this.fechaInicio);
  }

  get fechaFinFormateada(): string {
    return this.formatearFecha(this.fechaFin);
  }

  // MÉTODOS DE NAVEGACIÓN
  volverAInicio(): void {
    this.reservaCompletada = false;
    this.reservaRealizada = null;
    this.volverAlPaquete.emit();
  }

  verMisReservas(): void {
    console.log('Navegar a mis reservas');
  }

  nuevaReserva(): void {
    this.reservaCompletada = false;
    this.reservaRealizada = null;
    this.cantidadPersonas = 1;
    this.observaciones = '';
    this.mensajeError = '';

    // Recargar fechas según el tipo
    if (this.tipoReserva === 'PAQUETE') {
      this.fechaInicio = this.paquete.fechaInicio ? new Date(this.paquete.fechaInicio).toISOString().split('T')[0] : '';
      this.fechaFin = this.paquete.fechaFin ? new Date(this.paquete.fechaFin).toISOString().split('T')[0] : '';
    } else {
      const hoy = new Date();
      this.fechaInicio = hoy.toISOString().split('T')[0];
      this.fechaFin = this.fechaInicio;
    }
  }

  private recargarItem(): void {
    if (this.tipoReserva === 'PAQUETE' && this.paqueteId) {
      this.reservaService.obtenerPaquetePorId(this.paqueteId).subscribe({
        next: data => {
          console.log('Paquete recargado:', data);
          this.paquete = data;
        },
        error: err => console.error('Error al recargar paquete:', err)
      });
    } else if (this.tipoReserva === 'ACTIVIDAD' && this.actividadId) {
      this.reservaService.obtenerActividadPorId(this.actividadId).subscribe({
        next: data => {
          console.log('Actividad recargada:', data);
          this.actividad = data;
        },
        error: err => console.error('Error al recargar actividad:', err)
      });
    }
  }

  // Método para debug
  debugItem(): void {
    console.log('=== DEBUG ITEM ===');
    console.log('Tipo:', this.tipoReserva);
    console.log('Item completo:', this.itemActual);
    console.log('Proveedor:', this.itemActual?.proveedor);
    console.log('Teléfono:', this.itemActual?.proveedor?.telefono);
    console.log('Reserva completada:', this.reservaCompletada);
  }

  // Método alternativo para compatibilidad (puedes remover después)
  debugPaquete(): void {
    this.debugItem();
  }
}
