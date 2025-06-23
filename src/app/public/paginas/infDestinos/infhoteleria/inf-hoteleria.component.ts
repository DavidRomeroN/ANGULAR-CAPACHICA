import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ServicioHoteleriaService } from '../../../../material-component/servicio-hoteleria/servicio-hoteleria.service';
import { CrearreservaService } from '../crearreserva/crearreserva.service';
import { CrearreservaComponent } from '../crearreserva/crearreserva.component';
import {CarritoService} from "../../../shared/Services/carrito.service";

// Asegúrate de tener este servicio

@Component({
  selector: 'app-inf-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inf-hoteleria.component.html',
  styleUrls: ['./inf-hoteleria.component.scss']
})
export class InfHotelComponent implements OnInit {
  hotel: any;
  mostrarFormulario = false;
  isAuthenticated = false;

  cantidadPersonas = 1;
  cantidadCarrito = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';

  hotelId!: number;

  reservaCompletada = false;
  reservaRealizada: any = null;
  mensajeError = '';
  totalCalculado = 0;

  usuarioId = 0;
  usuarioEmail = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private servicioHoteleriaService: ServicioHoteleriaService,
    private reservaService: CrearreservaService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hotelId = +id;
      this.cargarHotel(this.hotelId);
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

  cargarHotel(id: number): void {
    this.servicioHoteleriaService.getHoteles().subscribe({
      next: data => {
        this.hotel = data.find(h => h.idHoteleria === id);
        if (!this.hotel) {
          console.error('Hotel no encontrado');
          this.router.navigate(['/serviciohoteles']);
        }
      },
      error: err => console.error('Error al cargar hotel', err)
    });
  }

  manejarReserva(): void {
    this.checkAuthStatus();

    if (!this.isAuthenticated) {
      this.irAlLogin();
      return;
    }

    if (this.cantidadPersonas > this.hotel?.maxPersonas) {
      alert(`La cantidad de personas no puede exceder ${this.hotel.maxPersonas}`);
      return;
    }

    this.mostrarFormulario = true;
  }

  mostrarReserva(): void {
    if (this.cantidadPersonas > this.hotel?.maxPersonas) {
      alert(`La cantidad de personas no puede exceder ${this.hotel.maxPersonas}`);
      return;
    }
    this.mostrarFormulario = true;
  }

  validarCantidadPersonas(): void {
    if (this.hotel && this.cantidadPersonas > this.hotel.maxPersonas) {
      this.cantidadPersonas = this.hotel.maxPersonas;
      alert(`La cantidad máxima de personas para esta habitación es ${this.hotel.maxPersonas}.`);
    }
    if (this.cantidadPersonas < 1) {
      this.cantidadPersonas = 1;
    }
  }

  calcularPrecioTotal(): number {
    if (!this.hotel || !this.fechaInicio || !this.fechaFin) {
      return 0;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.totalCalculado = this.hotel.servicio.precioBase * diffDays;
    return this.totalCalculado;
  }

  validarFechas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return false;

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (inicio < hoy) return false;
    if (fin <= inicio) return false;

    return true;
  }

  confirmarReserva(): void {
    if (!this.fechaInicio || !this.fechaFin || !this.observaciones.trim()) {
      this.mensajeError = 'Todos los campos son obligatorios.';
      return;
    }

    const reserva = {
      hotelId: this.hotelId,
      usuarioId: this.usuarioId,
      cantidad: this.cantidadPersonas,
      fechaInicio: this.fechaInicio + 'T00:00:00',
      fechaFin: this.fechaFin + 'T00:00:00',
      observaciones: this.observaciones
    };

    console.log('Reserva enviada:', reserva);

    this.reservaRealizada = {
      ...reserva,
      id: Date.now(),
      fecha: new Date()
    };

    this.reservaCompletada = true;
    alert('✅ Reserva realizada con éxito');
  }

  contactarHotelWhatsApp(): void {
    const telefono = this.hotel?.servicio?.proveedor?.telefono || '';
    if (!telefono) {
      alert('❌ Teléfono no disponible');
      return;
    }

    let numero = telefono.toString().replace(/[^\d]/g, '');
    if (!numero.startsWith('51') && numero.length === 9) {
      numero = '51' + numero;
    }

    const mensaje = `Hola ${this.hotel?.servicio?.proveedor?.nombreCompleto || 'Estimado'}:
Estoy interesado en reservar en su hotel "${this.hotel?.nombre}" del ${this.fechaInicio} al ${this.fechaFin}.
Somos ${this.cantidadPersonas} personas.
Correo: ${this.usuarioEmail}
Gracias.`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  agregarAlCarrito(): void {
    if (!this.isAuthenticated) {
      this.irAlLogin();
      return;
    }

    const item = {
      usuarioId: this.usuarioId,
      tipoElemento: 'SERVICIO',
      idElemento: this.hotelId,
      cantidad: this.cantidadCarrito,
      precioUnitario: this.hotel?.servicio?.precioBase || 0
    };

    this.carritoService.agregarItem(this.usuarioId, item).subscribe(() => {
      alert('✅ Hotel agregado al carrito');
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  verMisReservas(): void {
    this.router.navigate(['/reservas']);
  }

  nuevaReserva(): void {
    this.reservaCompletada = false;
    this.reservaRealizada = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.observaciones = '';
  }

  onReservaExitosa(): void {
    const id = this.hotel.idHoteleria ?? this.hotel.id;
    this.servicioHoteleriaService.getHoteles().subscribe({
      next: data => {
        this.hotel = data.find(hotel => hotel.idHoteleria === id);
        console.log('Hotel recargado después de reserva exitosa');
      },
      error: err => console.error('Error al recargar hotel', err)
    });
  }

  onVolverAlHotel(): void {
    this.mostrarFormulario = false;
    console.log('Usuario volvió al detalle del hotel');
  }

  obtenerEstrellas(): string {
    if (!this.hotel?.estrellas) return '';
    return '★'.repeat(this.hotel.estrellas) + '☆'.repeat(5 - this.hotel.estrellas);
  }

  incluyeDesayuno(): boolean {
    return this.hotel?.incluyeDesayuno === 'Si';
  }

  getFechaFormateada(fecha: string): string {
    return new Date(fecha).toLocaleDateString();
  }
  irAlRegistro(): void {
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

}
