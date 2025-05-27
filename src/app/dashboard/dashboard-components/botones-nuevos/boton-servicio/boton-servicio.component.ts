import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'; // <--- IMPORTANTE

@Component({
  selector: 'app-boton-servicio',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './boton-servicio.component.html',
  styleUrls: ['./boton-servicio.component.scss']
})
export class BotonServicioComponent {
  constructor(private router: Router) {}

  irAServicio() {
    this.router.navigate(['/servicios']);
  }
}
