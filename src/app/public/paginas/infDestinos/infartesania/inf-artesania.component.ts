import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioArtesaniaService } from '../../../../material-component/servicio-artesania/servicio-artesania.service';
import { AuthService } from 'src/app/services/auth.service';
import { CarritoService } from "../../../shared/Services/carrito.service";

export enum TipoElemento {
  SERVICIO = 'SERVICIO',
  ACTIVIDAD = 'ACTIVIDAD',
  PAQUETE = 'PAQUETE'
}

@Component({
  selector: 'app-inf-artesania',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inf-artesania.component.html',
  styleUrls: ['./inf-artesania.component.scss']
})
export class InfArtesaniaComponent implements OnInit {

  servicioArtesania: any = null; // ✅ INICIALIZADO EXPLÍCITAMENTE
  mostrarFormulario: boolean = false;
  isAuthenticated: boolean = false;
  usuarioId: number = 0;
  usuarioEmail: string = '';
  cantidadCarrito: number = 1;
  servicioId!: number;

  // Propiedades para solicitud de taller (TODAS INICIALIZADAS)
  cantidadParticipantes: number = 1;
  fechaInicio: string = '';
  fechaFin: string = '';
  observaciones: string = '';
  mensajeError: string = '';
  solicitudCompletada: boolean = false;
  solicitudRealizada: any = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private servicioArtesaniaService: ServicioArtesaniaService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicioId = +id;
      this.cargarServicioArtesania(this.servicioId);
    }
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();

    if (this.isAuthenticated) {
      const user = this.authService.getLoggedUser();
      this.usuarioId = user?.idUsuario || 0;
      this.usuarioEmail = user?.email || '';
    }
  }

  cargarServicioArtesania(id: number): void {
    this.servicioArtesaniaService.getArtesanias().subscribe({
      next: (data) => {
        // Buscar el servicio específico por ID
        this.servicioArtesania = data.find(item => item.idArtesania === id);
        if (!this.servicioArtesania) {
          console.error('Servicio de artesanía no encontrado');
        }
        console.log('Servicio de artesanía cargado:', this.servicioArtesania);
      },
      error: err => {
        console.error('Error al cargar servicio de artesanía', err);
      }
    });
  }

  // 🚀 MÉTODOS DE WHATSAPP

  contactarArtesanoWhatsApp(): void {
    console.log('Contactando artesano por WhatsApp...');
    console.log('Datos del servicio:', this.servicioArtesania);

    // ✅ VALIDACIÓN MEJORADA
    if (!this.servicioArtesania?.servicio?.proveedor?.telefono) {
      console.error('No se encontró teléfono del artesano');
      alert('❌ No se encontró número de teléfono del artesano. Contacta al administrador.');
      return;
    }

    let numeroTelefono = this.servicioArtesania.servicio.proveedor.telefono.toString().replace(/[^\d]/g, '');
    console.log('Número original:', this.servicioArtesania.servicio.proveedor.telefono);
    console.log('Número limpio:', numeroTelefono);

    if (!numeroTelefono.startsWith('51') && numeroTelefono.length === 9) {
      numeroTelefono = '51' + numeroTelefono;
    }

    console.log('Número final:', numeroTelefono);

    const mensaje = this.crearMensajeWhatsApp();
    console.log('Mensaje creado:', mensaje);

    const mensajeCodificado = encodeURIComponent(mensaje)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');

    const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
    console.log('URL de WhatsApp:', whatsappUrl);

    try {
      const ventanaWhatsApp = window.open(whatsappUrl, '_blank', 'width=800,height=600');

      if (!ventanaWhatsApp || ventanaWhatsApp.closed || typeof ventanaWhatsApp.closed == 'undefined') {
        console.warn('Popup bloqueado, mostrando alternativa');
        this.mostrarAlternativaWhatsApp(numeroTelefono, mensaje);
      } else {
        console.log('✅ WhatsApp abierto correctamente');
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

    const nivelTexto = this.getNivelTexto().toLowerCase();
    const artesanoNombre = this.servicioArtesania?.artesano || this.servicioArtesania?.servicio?.proveedor?.nombreCompleto || 'estimado artesano';

    return `Hola ${artesanoNombre}!

Tengo interes en tu taller de artesania y me gustaria coordinar los detalles.

*** DETALLES DEL TALLER ***

> Artesania: ${this.servicioArtesania?.tipoArtesania || 'No especificado'}
> Nivel: ${nivelTexto}
> Duracion: ${this.servicioArtesania?.duracionTaller || 0} horas
> Participantes: ${this.cantidadParticipantes}
> Fechas: ${fechaFormateada(this.fechaInicio)} al ${fechaFormateada(this.fechaFin)}
> Precio: S/. ${this.servicioArtesania?.servicio?.precio || 0}
> Mi email: ${this.usuarioEmail}

> Detalles adicionales:
- Origen cultural: ${this.servicioArtesania?.origenCultural || 'No especificado'}
- Incluye material: ${this.servicioArtesania?.incluyeMaterial ? 'Si' : 'No'}
- Visita taller: ${this.servicioArtesania?.visitaTaller ? 'Si' : 'No'}
- Max participantes: ${this.servicioArtesania?.maxParticipantes || 0}

> Observaciones:
${this.observaciones || 'Ninguna observacion especial'}

Me gustaria coordinar:
* Disponibilidad del taller
* Detalles del proceso de aprendizaje
* Materiales necesarios
* Ubicacion del taller
* Metodo de pago
* Certificacion si aplica

Quedo atento a tu respuesta!

--- Mensaje enviado desde el sistema de talleres ---`;
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

  // 📋 MÉTODOS DE SOLICITUD/RESERVA

  solicitarTaller(): void {
    this.checkAuthStatus();

    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    this.mostrarFormulario = true;
  }

  confirmarSolicitud(): void {
    // ✅ VALIDACIONES MEJORADAS
    if (!this.servicioArtesania) {
      this.mensajeError = '❌ Error: No se ha cargado la información del taller';
      return;
    }

    if (this.cantidadParticipantes > this.servicioArtesania.maxParticipantes) {
      this.mensajeError = `❌ Máximo ${this.servicioArtesania.maxParticipantes} participantes permitidos`;
      return;
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

    const solicitud = {
      servicioArtesania: this.servicioId,
      usuario: this.usuarioId,
      cantidadParticipantes: this.cantidadParticipantes,
      fechaInicio: formatoFecha(this.fechaInicio),
      fechaFin: formatoFecha(this.fechaFin),
      estado: 'PENDIENTE',
      observaciones: this.observaciones
    };

    console.log('Enviando solicitud:', solicitud);

    this.solicitudRealizada = {
      ...solicitud,
      id: Date.now(),
      fechaCreacion: new Date()
    };

    this.solicitudCompletada = true;
    this.mensajeError = '';
    alert('✅ Solicitud enviada con éxito');
  }

  // 🛒 MÉTODO DE CARRITO

  agregarAlCarrito(): void {
    if (this.servicioArtesania && this.isAuthenticated) {
      const item = {
        usuarioId: this.usuarioId,
        tipoElemento: TipoElemento.SERVICIO,
        idElemento: this.servicioArtesania.idArtesania,
        cantidad: this.cantidadCarrito,
        precioUnitario: this.servicioArtesania.servicio?.precio || 0
      };

      console.log('Item de artesanía para el carrito:', item);
      this.carritoService.agregarItem(this.usuarioId, item).subscribe(() => {
        alert('Taller agregado al carrito con éxito');
      });
    } else {
      alert('Debes iniciar sesión para agregar al carrito.');
    }
  }

  // 🎯 MÉTODOS DE NAVEGACIÓN

  irAlLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  irAlRegistro(): void {
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  manejarSolicitud(): void {
    this.checkAuthStatus();

    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    this.mostrarFormulario = true;
  }

  nuevaSolicitud(): void {
    this.solicitudCompletada = false;
    this.solicitudRealizada = null;
    this.cantidadParticipantes = 1;
    this.observaciones = '';
    this.mensajeError = '';
    this.fechaInicio = '';
    this.fechaFin = '';
  }

  verMisSolicitudes(): void {
    console.log('Navegar a mis solicitudes de talleres');
  }

  // 📊 MÉTODOS DE APOYO (TODOS CON VALIDACIONES)

  get totalCalculado(): number {
    if (this.servicioArtesania?.servicio?.precio && this.cantidadParticipantes) {
      return this.servicioArtesania.servicio.precio * this.cantidadParticipantes;
    }
    return 0;
  }

  // ✅ MÉTODOS CON VALIDACIONES AGREGADAS

  getNivelColor(): string {
    if (!this.servicioArtesania?.nivelDificultad) return '#6c757d';

    switch (this.servicioArtesania.nivelDificultad) {
      case 'PRINCIPIANTE': return '#28a745';
      case 'INTERMEDIO': return '#ffc107';
      case 'AVANZADO': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getNivelTexto(): string {
    if (!this.servicioArtesania?.nivelDificultad) return 'No especificado';

    switch (this.servicioArtesania.nivelDificultad) {
      case 'PRINCIPIANTE': return 'Principiante';
      case 'INTERMEDIO': return 'Intermedio';
      case 'AVANZADO': return 'Avanzado';
      default: return 'No especificado';
    }
  }
}
