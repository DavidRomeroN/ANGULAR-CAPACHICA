import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CrearreservaComponent } from "../crearreserva/crearreserva.component";
import { CarritoService } from "../../../shared/Services/carrito.service";
import { CrearreservaService } from "../crearreserva/crearreserva.service";
import {ActividadService} from "../../../../material-component/actividades/actividades.service";

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
    private actividadesService: ActividadService,
    private reservaService: CrearreservaService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
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

  agregarAlCarrito(): void {
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
      next: (data: any) => this.actividad = data,
      error: (err: any) => console.error('Error al cargar actividad', err)
    });
  }

  manejarReserva(): void {
    this.checkAuthStatus();

    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      }).then(); // Manejo del promise (opcional)
      return;
    }

    this.mostrarFormulario = true;
  }

  irAlRegistro(): void {
    this.router.navigate(['/register'], {
      queryParams: {
        returnUrl: this.router.url
      }
    }).then(); // Manejo del promise (opcional)
  }

  // Evento al completar la reserva exitosamente
  onReservaExitosa(): void {
    this.actividadesService.getById(this.actividadId).subscribe({
      next: (data: any) => {
        this.actividad = data;
        console.log('Actividad recargada después de reserva exitosa');
      },
      error: (err: any) => console.error('Error al recargar actividad', err)
    });
  }

  // Evento cuando el usuario quiere volver
  onVolverAlPaquete(): void {
    this.mostrarFormulario = false;
    console.log('Usuario volvió al detalle de la actividad');
  }

  // Imagen por defecto si hay error
  onImageError(event: any): void {
    event.target.src = 'assets/images/default-actividad.jpg';
  }
}
