import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import {ServicioHoteleriaService} from "../../../../material-component/servicio-hoteleria/servicio-hoteleria.service";
import {CrearreservaService} from "../crearreserva/crearreserva.service";
import {CrearreservaComponent} from "../crearreserva/crearreserva.component";


@Component({
  selector: 'app-inf-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearreservaComponent],
  templateUrl: './inf-hotel.component.html',
  styleUrls: ['./inf-hotel.component.scss']
})
export class InfHotelComponent implements OnInit {
  hotel: any;
  mostrarFormulario = false;
  isAuthenticated = false;

  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';

  hotelId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioHoteleriaService: ServicioHoteleriaService,
    private reservaService: CrearreservaService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    // Verificar estado de autenticación
    this.checkAuthStatus();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hotelId = +id;
      this.cargarHotel(this.hotelId);
    }
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
  }

  cargarHotel(id: number): void {
    // Como tu servicio no tiene getById, necesitamos obtener todos y filtrar
    this.servicioHoteleriaService.getHoteleria().subscribe({
      next: data => {
        this.hotel = data.find(hotel => hotel.idHoteleria === id);
        if (!this.hotel) {
          console.error('Hotel no encontrado');
          this.router.navigate(['/serviciohoteles']); // Redirigir si no se encuentra
        }
      },
      error: err => console.error('Error al cargar hotel', err)
    });
  }

  /**
   * Método principal para manejar el clic en "Reservar"
   */
  manejarReserva(): void {
    // Verificar nuevamente la autenticación antes de proceder
    this.checkAuthStatus();

    if (!this.isAuthenticated) {
      // Si no está autenticado, redirigir al login con returnUrl
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      });
      return;
    }

    // Validar capacidad antes de mostrar formulario
    if (this.cantidadPersonas > this.hotel?.maxPersonas) {
      alert(`La cantidad de personas no puede exceder ${this.hotel.maxPersonas} para este tipo de habitación.`);
      return;
    }

    // Si está autenticado, mostrar el formulario de reserva
    this.mostrarFormulario = true;
  }

  /**
   * Método para ir al registro
   */
  irAlRegistro(): void {
    this.router.navigate(['/register'], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
  }

  mostrarReserva(): void {
    // Validar capacidad antes de mostrar formulario
    if (this.cantidadPersonas > this.hotel?.maxPersonas) {
      alert(`La cantidad de personas no puede exceder ${this.hotel.maxPersonas} para este tipo de habitación.`);
      return;
    }
    this.mostrarFormulario = true;
  }

  /**
   * Validar cantidad de personas según capacidad máxima del hotel
   */
  validarCantidadPersonas(): void {
    if (this.hotel && this.cantidadPersonas > this.hotel.maxPersonas) {
      this.cantidadPersonas = this.hotel.maxPersonas;
      alert(`La cantidad máxima de personas para esta habitación es ${this.hotel.maxPersonas}.`);
    }
    if (this.cantidadPersonas < 1) {
      this.cantidadPersonas = 1;
    }
  }

  /**
   * Obtener el precio total considerando las noches y personas
   */
  calcularPrecioTotal(): number {
    if (!this.hotel || !this.fechaInicio || !this.fechaFin) {
      return 0;
    }

    const fechaInicioDate = new Date(this.fechaInicio);
    const fechaFinDate = new Date(this.fechaFin);
    const diffTime = Math.abs(fechaFinDate.getTime() - fechaInicioDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return this.hotel.servicio.precioBase * diffDays;
  }

  /**
   * Verificar si las fechas son válidas
   */
  validarFechas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) {
      return false;
    }

    const fechaInicioDate = new Date(this.fechaInicio);
    const fechaFinDate = new Date(this.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // La fecha de inicio debe ser hoy o posterior
    if (fechaInicioDate < hoy) {
      return false;
    }

    // La fecha de fin debe ser posterior a la fecha de inicio
    if (fechaFinDate <= fechaInicioDate) {
      return false;
    }

    return true;
  }

  // MÉTODO CORREGIDO: No ocultar el formulario después de la reserva exitosa
  onReservaExitosa(): void {
    // NO ponemos mostrarFormulario = false aquí
    // El componente hijo maneja su propio estado de reservaCompletada

    // Solo recargar el hotel para actualizar los datos
    const id = this.hotel.idHoteleria ?? this.hotel.id;
    this.servicioHoteleriaService.getHoteleria().subscribe({
      next: data => {
        this.hotel = data.find(hotel => hotel.idHoteleria === id);
        console.log('Hotel recargado después de reserva exitosa');
      },
      error: err => console.error('Error al recargar hotel', err)
    });
  }

  // NUEVO MÉTODO: Para manejar cuando el usuario quiere volver al hotel
  onVolverAlHotel(): void {
    this.mostrarFormulario = false;
    console.log('Usuario volvió al detalle del hotel');
  }

  /**
   * Obtener el texto de estrellas para mostrar
   */
  obtenerEstrellas(): string {
    if (!this.hotel?.estrellas) return '';
    return '★'.repeat(this.hotel.estrellas) + '☆'.repeat(5 - this.hotel.estrellas);
  }

  /**
   * Verificar si incluye desayuno
   */
  incluyeDesayuno(): boolean {
    return this.hotel?.incluyeDesayuno === 'Si';
  }
}
