import { Component, OnInit, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CrearreservaService } from "../../paginas/infDestinos/crearreserva/crearreserva.service";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private toggleButton: any;
  private sidebarVisible: boolean;

  mostrarReservas = false;
  reservas: any[] = [];
  reservasFiltradas: any[] = [];
  cargandoReservas = false;
  filtroTexto = '';
  filtroEstado = '';

  constructor(
    public location: Location,
    private element: ElementRef,
    private router: Router,
    private crearReservaService: CrearreservaService,
    private authService: AuthService
  ) {
    this.sidebarVisible = false;
  }

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const html = document.getElementsByTagName('html')[0];
    setTimeout(function(){
      toggleButton.classList.add('toggled');
    }, 500);
    html.classList.add('nav-open');
    this.sidebarVisible = true;
  };

  sidebarClose() {
    const html = document.getElementsByTagName('html')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    html.classList.remove('nav-open');
  };

  sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  };

  isHome() {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
      titlee = titlee.slice(1);
    }
    return titlee === '/home';
  }

  isDocumentation() {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
      titlee = titlee.slice(1);
    }
    return titlee === '/documentation';
  }

  // ✅ Método corregido para mostrar/ocultar reservas
  toggleReservas() {
    this.mostrarReservas = !this.mostrarReservas;

    // Solo cargar reservas cuando se abre el dropdown
    if (this.mostrarReservas && this.reservas.length === 0) {
      this.cargarReservas();
    }
  }

  // ✅ Verificar si el usuario está logueado
  estaLogueado(): boolean {
    const usuario = localStorage.getItem('usuarioLogueado');
    return usuario !== null;
  }

  // ✅ Método para cerrar sesión
  cerrarSesion(): void {
    // Confirmar antes de cerrar sesión
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        // Limpiar datos del localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogueado');
        localStorage.removeItem('user'); // Por si acaso también tienes esta clave

        // Limpiar datos del componente
        this.reservas = [];
        this.reservasFiltradas = [];
        this.mostrarReservas = false;

        // Usar el método logout del AuthService si existe
        if (this.authService && this.authService.logout) {
          this.authService.logout();
        } else {
          // Si no existe el método, redirigir manualmente
          this.router.navigate(['/capachica']);
        }

        console.log('Sesión cerrada exitosamente');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Aún así intentar redirigir
        this.router.navigate(['/capachica']);
      }
    }
  }

  // ✅ Método para ir al login
  irAlLogin(): void {
    this.router.navigate(['/login']);
  }

  // ✅ Método para ir al registro
  irAlRegistro(): void {
    this.router.navigate(['/register']);
  }

  // 🚀 MÉTODO ACTUALIZADO: Cargar reservas con información del proveedor
  cargarReservas() {
    const usuario = localStorage.getItem('usuarioLogueado');
    if (!usuario) {
      console.warn('No hay usuario logueado');
      return;
    }

    try {
      const usuarioData = JSON.parse(usuario);
      const usuarioId = usuarioData.idUsuario;

      if (!usuarioId) {
        console.error('No se encontró idUsuario en los datos del usuario');
        return;
      }

      this.cargandoReservas = true;
      this.crearReservaService.obtenerMisReservas(usuarioId).subscribe({
        next: (data) => {
          // ✅ Mapear los datos para incluir información del paquete Y PROVEEDOR
          this.reservas = (data || []).map((reserva: any) => ({
            ...reserva,
            // Agregar propiedades del paquete para fácil acceso en el template
            paqueteTitulo: reserva.paquete?.titulo || 'Paquete sin título',
            paqueteDescripcion: reserva.paquete?.descripcion || '',
            paquetePrecio: reserva.paquete?.precioTotal || 0,
            paqueteImagen: reserva.paquete?.imagenUrl || '',
            paqueteDuracion: reserva.paquete?.duracionDias || 0,
            paqueteLocalidad: reserva.paquete?.localidad || '',
            paqueteTipoActividad: reserva.paquete?.tipoActividad || '',
            // Información del destino si está disponible
            destinoNombre: reserva.paquete?.destino?.nombre || '',
            destinoUbicacion: reserva.paquete?.destino?.ubicacion || '',
            // 🚀 NUEVO: Información del proveedor
            proveedorNombre: reserva.paquete?.proveedor?.nombreCompleto || '',
            proveedorEmail: reserva.paquete?.proveedor?.email || '',
            proveedorTelefono: reserva.paquete?.proveedor?.telefono || ''
          }));

          // ✅ Ordenar reservas por fecha de creación (más reciente arriba)
          this.reservas.sort((a, b) => {
            const fechaA = new Date(a.fechaInicio || 0).getTime();
            const fechaB = new Date(b.fechaInicio || 0).getTime();
            return fechaB - fechaA; // Orden descendente (más reciente primero)
          });

          // ✅ Aplicar filtro inicial
          this.aplicarFiltros();

          this.cargandoReservas = false;
          console.log('Reservas cargadas y mapeadas:', this.reservas);
        },
        error: (error) => {
          console.error('Error al cargar reservas', error);
          this.reservas = [];
          this.cargandoReservas = false;
        }
      });
    } catch (error) {
      console.error('Error al parsear datos del usuario:', error);
    }
  }

  // ✅ Método para cerrar el dropdown al hacer clic fuera
  cerrarReservas() {
    this.mostrarReservas = false;
    // Limpiar filtros al cerrar
    this.filtroTexto = '';
    this.filtroEstado = '';
  }

  // ✅ Método para aplicar filtros
  aplicarFiltros() {
    this.reservasFiltradas = this.reservas.filter(reserva => {
      const cumpleFiltroTexto = !this.filtroTexto ||
        reserva.paqueteTitulo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        reserva.paqueteDescripcion.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        reserva.paqueteLocalidad.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        reserva.destinoNombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        reserva.paqueteTipoActividad.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const cumpleFiltroEstado = !this.filtroEstado || reserva.estado === this.filtroEstado;

      return cumpleFiltroTexto && cumpleFiltroEstado;
    });
  }

  // ✅ Método para limpiar filtros
  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  // ✅ Método para obtener estados únicos
  obtenerEstadosUnicos(): string[] {
    const estados = [...new Set(this.reservas.map(r => r.estado))];
    return estados.filter(estado => estado); // Filtrar valores vacíos
  }

  // ✅ Método para formatear fechas (opcional)
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  // ✅ Método para obtener el estado en español (opcional)
  obtenerEstadoEspanol(estado: string): string {
    const estados: { [key: string]: string } = {
      'CONFIRMADA': 'Confirmada',
      'PENDIENTE': 'Pendiente',
      'CANCELADA': 'Cancelada',
      'COMPLETADA': 'Completada'
    };
    return estados[estado] || estado;
  }

  // 🚀 NUEVOS MÉTODOS PARA WHATSAPP

  /**
   * Contactar al proveedor por WhatsApp desde una reserva
   */
  contactarProveedorWhatsApp(reserva: any): void {
    console.log('Contactando proveedor por WhatsApp:', reserva);

    // Validar que existe el teléfono del proveedor
    if (!reserva.proveedorTelefono) {
      alert('❌ No se encontró número de teléfono del proveedor.');
      return;
    }

    // Limpiar el número de teléfono
    let numeroTelefono = reserva.proveedorTelefono.toString().replace(/[^\d]/g, '');
    console.log('Número original:', reserva.proveedorTelefono);
    console.log('Número limpio:', numeroTelefono);

    // Agregar código de país si es necesario (Perú +51)
    if (!numeroTelefono.startsWith('51') && numeroTelefono.length === 9) {
      numeroTelefono = '51' + numeroTelefono;
    }

    console.log('Número final:', numeroTelefono);

    // Crear mensaje personalizado para la reserva
    const mensaje = this.crearMensajeWhatsAppReserva(reserva);
    console.log('Mensaje creado:', mensaje);

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    console.log('URL de WhatsApp:', whatsappUrl);

    try {
      // Intentar abrir WhatsApp
      const ventanaWhatsApp = window.open(whatsappUrl, '_blank', 'width=800,height=600');

      if (!ventanaWhatsApp || ventanaWhatsApp.closed || typeof ventanaWhatsApp.closed == 'undefined') {
        // Si el popup fue bloqueado
        console.warn('Popup bloqueado, mostrando alternativa');
        this.mostrarAlternativaWhatsAppNavbar(numeroTelefono, mensaje);
      } else {
        console.log('✅ WhatsApp abierto correctamente');
        // Mostrar mensaje de confirmación después de un breve delay
        setTimeout(() => {
          alert('📱 Redirigiendo a WhatsApp... Si no se abrió automáticamente, verifica que tengas WhatsApp instalado.');
        }, 1000);
      }
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      this.mostrarAlternativaWhatsAppNavbar(numeroTelefono, mensaje);
    }
  }

  /**
   * Crear mensaje personalizado de WhatsApp para una reserva existente
   */
  private crearMensajeWhatsAppReserva(reserva: any): string {
    const formatearFecha = (fecha: string) => {
      if (!fecha) return 'No especificada';
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Obtener email del usuario logueado
    const usuarioEmail = this.obtenerEmailUsuarioActual();

    return `🎯 ¡Hola ${reserva.proveedorNombre || 'estimado proveedor'}! 👋

Tengo una consulta sobre mi reserva realizada para tu paquete turístico.

📋 *DETALLES DE MI RESERVA:*
━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ *Paquete:* ${reserva.paqueteTitulo}
📅 *Fecha inicio:* ${formatearFecha(reserva.fechaInicio)}
📅 *Fecha fin:* ${formatearFecha(reserva.fechaFin)}
👥 *Personas:* ${reserva.cantidadPersonas}
💰 *Total:* S/. ${this.calcularTotalReserva(reserva)}
📧 *Mi email:* ${usuarioEmail}
📦 *Estado:* ${this.obtenerEstadoEspanol(reserva.estado)}
━━━━━━━━━━━━━━━━━━━━━━━━

${reserva.observaciones ? `📝 *Observaciones originales:*\n${reserva.observaciones}\n\n` : ''}❓ *Me gustaría consultar sobre:*
• Estado actual de mi reserva
• Detalles del itinerario
• Punto de encuentro y horarios
• Información adicional necesaria
• Confirmación de servicios incluidos

¡Espero tu respuesta! 😊✨

_Consulta enviada desde mis reservas_`;
  }

  /**
   * Mostrar modal alternativo si falla WhatsApp
   */
  private mostrarAlternativaWhatsAppNavbar(numeroTelefono: string, mensaje: string): void {
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

  /**
   * Calcular el total de una reserva
   */
  calcularTotalReserva(reserva: any): string {
    if (reserva.paquetePrecio && reserva.cantidadPersonas) {
      const total = parseFloat(reserva.paquetePrecio.toString()) * reserva.cantidadPersonas;
      return total.toFixed(2);
    }
    return (reserva.paquetePrecio || '0.00').toString();
  }

  /**
   * Obtener email del usuario actual
   */
  private obtenerEmailUsuarioActual(): string {
    try {
      const usuario = localStorage.getItem('usuarioLogueado');
      if (usuario) {
        const parsed = JSON.parse(usuario);
        return parsed.email || 'No especificado';
      }
    } catch (error) {
      console.error('Error al obtener email del usuario:', error);
    }
    return 'No especificado';
  }
}
