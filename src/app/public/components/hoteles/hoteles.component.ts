import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicioHoteleriaService } from '../../../material-component/servicio-hoteleria/servicio-hoteleria.service';

interface Hoteleria {
  idHoteleria: number;
  tipoHabitacion: string;
  estrellas: number;
  incluyeDesayuno: 'Si' | 'No';
  maxPersonas: number;
  servicio: {
    idServicio: number;
    nombreServicio: string;
    descripcion: string;
    precioBase: number;
    estado: string;
    tipo: {
      idTipo: number;
      nombre: string;
      descripcion: string;
    };
    imagenUrl?: string;
  };
}

@Component({
  selector: 'app-hoteleria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hoteles.component.html',
  styleUrls: ['./hoteles.component.scss']
})
export class HoteleriaComponent implements OnInit {

  hoteles: Hoteleria[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  filtroTipo: string = '';

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  constructor(
    private servicioHoteleriaService: ServicioHoteleriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.servicioHoteleriaService.getHoteles().subscribe({
      next: (data: Hoteleria[]) => {
        this.hoteles = data;
        this.isLoading = false;
        console.log('Hoteles cargados:', this.hoteles);
      },
      error: (err) => {
        console.error('Error cargando hoteles', err);
        this.error = 'Error al cargar hoteles.';
        this.isLoading = false;
      }
    });
  }

  scrollLeft(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  }

  scrollRight(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  }

  verMasHotel(id: number): void {
    this.router.navigate(['/capachica/detalle-hotel', id]);
  }

  getEstrellaColor(estrellas: number): string {
    if (estrellas >= 5) return '#ffd700'; // dorado
    if (estrellas >= 3) return '#c0c0c0'; // plata
    return '#cd7f32'; // bronce
  }

  hotelesFiltrados(): Hoteleria[] {
    if (!this.filtroTipo) return this.hoteles;
    const filtro = this.filtroTipo.toLowerCase();
    return this.hoteles.filter(h =>
      h.tipoHabitacion.toLowerCase().includes(filtro) ||
      h.servicio?.nombreServicio?.toLowerCase().includes(filtro)
    );
  }
}
