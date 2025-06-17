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
  @Input() paqueteId!: number;
  @Output() reservaExitosa = new EventEmitter<void>();
  @Output() volverAlPaquete = new EventEmitter<void>(); // NUEVO OUTPUT

  paquete: any;
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
    console.log('Iniciando componente con paqueteId:', this.paqueteId);

    if (this.paqueteId) {
      this.cargarPaquete();
    }

    this.cargarUsuario();
  }

  private cargarPaquete(): void {
    this.reservaService.obtenerPaquetePorId(this.paqueteId).subscribe({
      next: data => {
        console.log('Paquete cargado:', data);
        this.paquete = data;

        // Validar que el proveedor tenga teléfono
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
    // Validaciones
    if (this.cantidadPersonas > this.paquete.cuposMaximos) {
      this.mensajeError = `❌ No hay suficientes cupos. Máximo permitido: ${this.paquete.cuposMaximos}`;
      return;
    }

    if (!this.observaciones.trim()) {
      this.mensajeError = '❌ Las observaciones son obligatorias';
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

    console.log('Enviando reserva:', reserva);

    this.reservaService.crearReserva(reserva).subscribe({
      next: (response) => {
        console.log('Reserva creada exitosamente:', response);

        // Manejar el caso cuando response es null o undefined
        let reservaId: number;

        if (response && response.id) {
          // Si la respuesta tiene un ID, usarlo
          reservaId = response.id;
        } else {
          // Si no hay ID en la respuesta, generar uno temporal
          reservaId = Date.now();
          console.warn('⚠️ La respuesta del servidor no contiene ID, usando ID temporal:', reservaId);
        }

        // Guardar datos de la reserva para mostrar en el resumen
        this.reservaRealizada = {
          ...reserva,
          id: reservaId,
          fechaCreacion: new Date()
        };

        // Cambiar estado para mostrar confirmación
        this.reservaCompletada = true;
        this.mensajeError = '';

        alert('✅ Reserva realizada con éxito');
        this.recargarPaquete();
        this.reservaExitosa.emit();
      },
      error: err => {
        console.error('Error al crear reserva:', err);
        this.mensajeError = '❌ Error al crear la reserva. Intenta nuevamente.';
        alert('❌ Error al crear la reserva');
      }
    });
  }

  // Método mejorado para contactar por WhatsApp
  contactarPorWhatsApp(): void {
    console.log('Intentando contactar por WhatsApp...');
    console.log('Datos del paquete:', this.paquete);

    // Validar que existe el proveedor y su teléfono
    if (!this.paquete?.proveedor?.telefono) {
      console.error('No se encontró teléfono del proveedor');
      alert('❌ No se encontró número de teléfono del proveedor. Contacta al administrador.');
      return;
    }

    // Limpiar el número de teléfono
    let numeroTelefono = this.paquete.proveedor.telefono.toString().replace(/[^\d]/g, '');
    console.log('Número original:', this.paquete.proveedor.telefono);
    console.log('Número limpio:', numeroTelefono);

    // Agregar código de país si es necesario (Perú +51)
    if (!numeroTelefono.startsWith('51') && numeroTelefono.length === 9) {
      numeroTelefono = '51' + numeroTelefono;
    }

    console.log('Número final:', numeroTelefono);

    // Crear mensaje personalizado
    const mensaje = this.crearMensajeWhatsApp();
    console.log('Mensaje creado:', mensaje);

    // Crear URL de WhatsApp con mejor codificación para emojis
    const mensajeCodificado = encodeURIComponent(mensaje)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');

    const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
    console.log('URL de WhatsApp:', whatsappUrl);

    try {
      // Intentar abrir WhatsApp
      const ventanaWhatsApp = window.open(whatsappUrl, '_blank', 'width=800,height=600');

      if (!ventanaWhatsApp || ventanaWhatsApp.closed || typeof ventanaWhatsApp.closed == 'undefined') {
        // Si el popup fue bloqueado
        console.warn('Popup bloqueado, mostrando alternativa');
        this.mostrarAlternativaWhatsApp(numeroTelefono, mensaje);
      } else {
        console.log('✅ WhatsApp abierto correctamente');
        // Mostrar mensaje de confirmación después de un breve delay
        setTimeout(() => {
          alert('📱 Redirigiendo a WhatsApp... Si no se abrió automáticamente, verifica que tengas WhatsApp instalado.');
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

    return `Hola ${this.paquete.proveedor?.nombreCompleto || 'estimado proveedor'}! 👋

Acabo de realizar una reserva para tu paquete turistico y me gustaria coordinar los detalles.

*DETALLES DE MI RESERVA:*

🏷 *Paquete:* ${this.paquete.titulo}
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

  // Getters para fechas formateadas
  get fechaInicioFormateada(): string {
    return this.formatearFecha(this.fechaInicio);
  }

  get fechaFinFormateada(): string {
    return this.formatearFecha(this.fechaFin);
  }

  // Método para obtener el total calculado
  get totalCalculado(): number {
    return this.paquete ? (this.paquete.precioTotal * this.cantidadPersonas) : 0;
  }

  // MÉTODOS DE NAVEGACIÓN ACTUALIZADOS
  volverAInicio(): void {
    this.reservaCompletada = false;
    this.reservaRealizada = null;
    // Emitir evento al padre para ocultar el formulario completo
    this.volverAlPaquete.emit();
  }

  verMisReservas(): void {
    // this.router.navigate(['/mis-reservas']);
    console.log('Navegar a mis reservas');
  }

  nuevaReserva(): void {
    // Resetear el formulario pero mantener el componente visible
    this.reservaCompletada = false;
    this.reservaRealizada = null;
    this.cantidadPersonas = 1;
    this.observaciones = '';
    this.mensajeError = '';

    // Recargar las fechas del paquete
    this.fechaInicio = this.paquete.fechaInicio ? new Date(this.paquete.fechaInicio).toISOString().split('T')[0] : '';
    this.fechaFin = this.paquete.fechaFin ? new Date(this.paquete.fechaFin).toISOString().split('T')[0] : '';
  }

  private recargarPaquete(): void {
    if (this.paqueteId) {
      this.reservaService.obtenerPaquetePorId(this.paqueteId).subscribe({
        next: data => {
          console.log('Paquete recargado:', data);
          this.paquete = data;
        },
        error: err => console.error('Error al recargar paquete:', err)
      });
    }
  }

  // Método para debug - remover en producción
  debugPaquete(): void {
    console.log('=== DEBUG PAQUETE ===');
    console.log('Paquete completo:', this.paquete);
    console.log('Proveedor:', this.paquete?.proveedor);
    console.log('Teléfono:', this.paquete?.proveedor?.telefono);
    console.log('Reserva completada:', this.reservaCompletada);
  }
}
