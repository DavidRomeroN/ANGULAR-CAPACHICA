import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaquetesService } from 'src/app/material-component/paquetes/paquetes.service';
import { CrearreservaService } from '../../crearreserva/crearreserva.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CrearreservaComponent } from "../../crearreserva/crearreserva.component";

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
    private authService: AuthService
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

  // Este método lo llamamos cuando el hijo emita que la reserva fue exitosa
  onReservaExitosa(): void {
    this.mostrarFormulario = false;
    const id = this.paquete.id ?? this.paquete.idPaquete;
    this.paquetesService.getById(id).subscribe({
      next: data => this.paquete = data,
      error: err => console.error('Error al recargar paquete', err)
    });
  }
}
