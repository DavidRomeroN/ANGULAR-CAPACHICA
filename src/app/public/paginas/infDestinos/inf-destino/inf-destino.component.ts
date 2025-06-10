import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from "@angular/common";
import { DestinosService } from "../../../../material-component/destinos/destinos.service";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-inf-destino',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inf-destino.component.html',
  styleUrls: ['./inf-destino.component.scss']
})
export class InfDestinoComponent implements OnInit {
  destino: any;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinoService: DestinosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    this.isAuthenticated = this.authService.isLoggedIn();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDestino(+id);
    }
  }

  cargarDestino(id: number): void {
    // Usar el método estándar que ahora funciona sin autenticación
    this.destinoService.getById(id).subscribe({
      next: data => {
        this.destino = data;
        console.log('Destino cargado:', this.destino);
      },
      error: err => {
        console.error('Error al cargar destino', err);
      }
    });
  }

  /**
   * Método para ver paquetes relacionados con este destino
   */
  verPaquetes(): void {
    this.router.navigate(['/public/paquetes'], {
      queryParams: { destino: this.destino.id || this.destino.idDestino }
    });
  }

  /**
   * Método para ir al login
   */
  irAlLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
  }

  /**
   * Método para ir al registro
   */
  irAlRegistro(): void {
    this.router.navigate(['/register']);
  }
}
