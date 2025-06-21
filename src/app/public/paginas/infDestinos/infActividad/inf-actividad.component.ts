import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadesService } from 'src/app/material-component/actividades/actividades.service';

import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import {CrearreservaComponent} from "../crearreserva/crearreserva.component";
import {CarritoService} from "../../../shared/Services/carrito.service";
import {CrearreservaService} from "../crearreserva/crearreserva.service";


export enum TipoElemento {
  SERVICIO = 'SERVICIO',
  ACTIVIDAD = 'ACTIVIDAD',
  PAQUETE = 'PAQUETE'
}

@Component({
  selector: 'app-inf-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearreservaComponent],
  templateUrl: './inf-actividad.component.html',
  styleUrls: ['./inf-actividad.component.scss']
})
export class InfActividadComponent implements OnInit {
  actividad: any;
  mostrarFormulario = false;
  isAuthenticated = false;
  usuarioId: number = 0;
  cantidadCarrito: number = 1;

  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';

  actividadId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actividadesService: ActividadesService,
    private reservaService: CrearreservaService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    // Verificar estado de autenticación
    this.checkAuthStatus();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.actividadId = +id;
      this.cargarActividad(this.actividadId);
    }
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();

    if (this.isAuthenticated) {
      const user = this.authService.getLoggedUser();
      this.usuarioId = user?.idUsuario || 0;
    }
  }

  agregarAlCarrito() {
    if (this.actividad && this.isAuthenticated) {
      const item = {
        usuarioId: this.usuarioId,
        tipoElemento: TipoElemento.ACTIVIDAD,
        idElemento: this.actividad.idActividad,
        cantidad: this.cantidadCarrito,
        precioUnitario: this.actividad.precioBase
      };

      console.log('Item que se enviará al backend:', item);
      this.carritoService.agregarItem(this.usuarioId, item).subscribe(() => {
        alert('Actividad agregada al carrito con éxito');
      });
    } else {
      alert('Debes iniciar sesión para agregar al carrito.');
    }
  }

  cargarActividad(id: number): void {
    this.actividadesService.getById(id).subscribe({
      next: data => this.actividad = data,
      error: err => console.error('Error al cargar actividad', err)
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
    this.mostrarFormulario = true;
  }

  // MÉTODO CORREGIDO: No ocultar el formulario después de la reserva exitosa
  onReservaExitosa(): void {
    // NO ponemos mostrarFormulario = false aquí
    // El componente hijo maneja su propio estado de reservaCompletada

    // Solo recargar la actividad para actualizar los datos
    this.actividadesService.getById(this.actividadId).subscribe({
      next: data => {
        this.actividad = data;
        console.log('Actividad recargada después de reserva exitosa');
      },
      error: err => console.error('Error al recargar actividad', err)
    });
  }

  // NUEVO MÉTODO: Para manejar cuando el usuario quiere volver a la actividad
  onVolverAlPaquete(): void {
    this.mostrarFormulario = false;
    console.log('Usuario volvió al detalle de la actividad');
  }

  // Método auxiliar para manejar errores de imagen
  onImageError(event: any): void {
    event.target.src = 'assets/images/default-actividad.jpg';
  }
}
