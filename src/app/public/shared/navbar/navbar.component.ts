import { Component, OnInit, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import {CrearreservaService} from "../../paginas/infDestinos/crearreserva/crearreserva.service";

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
  cargandoReservas = false;

  constructor(
    public location: Location,
    private element: ElementRef,
    private crearReservaService: CrearreservaService
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
          // ✅ Mapear los datos para incluir información del paquete
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
            destinoUbicacion: reserva.paquete?.destino?.ubicacion || ''
          }));

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
}
