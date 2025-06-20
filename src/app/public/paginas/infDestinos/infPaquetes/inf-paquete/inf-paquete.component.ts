import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaquetesService } from 'src/app/material-component/paquetes/paquetes.service';
import { CrearreservaService } from '../../crearreserva/crearreserva.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CrearreservaComponent } from "../../crearreserva/crearreserva.component";
import {CarritoService} from "../../../../shared/Services/carrito.service";
import {CarritoItem} from "../../../../shared/models/carrito-item.model";


export enum TipoElemento {
  SERVICIO = 'SERVICIO',
  ACTIVIDAD = 'ACTIVIDAD',
  PAQUETE = 'PAQUETE'
}


@Component({
  selector: 'app-inf-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearreservaComponent],
  templateUrl: './inf-paquete.component.html',
  styleUrls: ['./inf-paquete.component.scss']
})
export class InfPaqueteComponent implements OnInit {
  paquete: any;
  mostrarFormulario = false;
  isAuthenticated = false;
  usuarioId: number = 0;
  cantidadCarrito: number = 1;


  cantidadPersonas = 1;
  fechaInicio = '';
  fechaFin = '';
  observaciones = '';

  paqueteId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paquetesService: PaquetesService,
    private reservaService: CrearreservaService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {
  }

  ngOnInit(): void {
    // Verificar estado de autenticación
    this.checkAuthStatus();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paqueteId = +id;
      this.cargarPaquete(this.paqueteId);
    }
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();

    if (this.isAuthenticated) {
      const user = this.authService.getLoggedUser();
      this.usuarioId = user?.idUsuario || 0; // asegúrate de que sea 'idUsuario'
    }
  }


  agregarAlCarrito() {
    if (this.paquete && this.isAuthenticated) {
      const item = {
        usuarioId: this.usuarioId,
        tipoElemento: TipoElemento.PAQUETE,
        idElemento: this.paquete.id || this.paquete.idPaquete,
        cantidad: this.cantidadCarrito,
        precioUnitario: this.paquete.precioTotal
      };

      console.log('Item que se enviará al backend:', item);
      this.carritoService.agregarItem(this.usuarioId, item).subscribe(() => {
        alert('Agregado al carrito con éxito');

      });
    } else {
      alert('Debes iniciar sesión para agregar al carrito.');
    }


  }



  cargarPaquete(id: number): void {
    this.paquetesService.getById(id).subscribe({
      next: data => this.paquete = data,
      error: err => console.error('Error al cargar paquete', err)
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

    // Solo recargar el paquete para actualizar los datos
    const id = this.paquete.id ?? this.paquete.idPaquete;
    this.paquetesService.getById(id).subscribe({
      next: data => {
        this.paquete = data;
        console.log('Paquete recargado después de reserva exitosa');
      },
      error: err => console.error('Error al recargar paquete', err)
    });
  }

  // NUEVO MÉTODO: Para manejar cuando el usuario quiere volver al paquete
  onVolverAlPaquete(): void {
    this.mostrarFormulario = false;
    console.log('Usuario volvió al detalle del paquete');
  }
}
