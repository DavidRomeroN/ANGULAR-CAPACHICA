import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicioArtesaniaService } from '../../../material-component/servicio-artesania/servicio-artesania.service';

interface Artesania {
  idArtesania: number;
  tipoArtesania: string;
  nivelDificultad: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  duracionTaller: number;
  incluyeMaterial: boolean;
  artesania: string;
  origenCultural: string;
  maxParticipantes: number;
  visitaTaller: boolean;
  artesano: string;
  servicio: any;
  imagenUrl?: string;
}

@Component({
  selector: 'app-artesanias',
  standalone: true, // ✅ AGREGAR STANDALONE
  imports: [CommonModule, FormsModule], // ✅ AGREGAR IMPORTS
  templateUrl: './artesanias.component.html',
  styleUrls: ['./artesanias.component.scss']
})
export class ArtesaniasComponent implements OnInit {

  artesanias: Artesania[] = [];
  isLoading = true;
  error: string | null = null;
  filtroTipo: string = '';

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  constructor(
    private servicioArtesaniaService: ServicioArtesaniaService, // ✅ NOMBRE CORRECTO
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ USAR EL MÉTODO CORRECTO
    this.servicioArtesaniaService.getArtesanias().subscribe({
      next: (data: any) => { // ✅ TIPAR EXPLÍCITAMENTE
        this.artesanias = data;
        this.isLoading = false;
        console.log('Artesanías cargadas:', this.artesanias);
      },
      error: (err: any) => { // ✅ TIPAR EXPLÍCITAMENTE
        console.error('Error cargando artesanías', err);
        this.error = 'Error al cargar artesanías.';
        this.isLoading = false;
      }
    });
  }

  scrollLeft(): void {
    this.scrollContainer.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    this.scrollContainer.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  }

  verMasArtesania(id: number): void { // ✅ NOMBRE CONSISTENTE
    console.log('Navegando a artesanía:', id);
    this.router.navigate(['/capachica/detalle-artesania', id]);
  }

  getNivelColor(nivel: string): string {
    switch (nivel) {
      case 'PRINCIPIANTE': return '#28a745';
      case 'INTERMEDIO': return '#ffc107';
      case 'AVANZADO': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getNivelTexto(nivel: string): string {
    switch (nivel) {
      case 'PRINCIPIANTE': return 'Principiante';
      case 'INTERMEDIO': return 'Intermedio';
      case 'AVANZADO': return 'Avanzado';
      default: return 'No especificado';
    }
  }

  artesaniasFiltradas(): Artesania[] {
    if (!this.filtroTipo) {
      return this.artesanias;
    }
    return this.artesanias.filter(a =>
      a.tipoArtesania.toLowerCase().includes(this.filtroTipo.toLowerCase()) ||
      a.artesano.toLowerCase().includes(this.filtroTipo.toLowerCase()) ||
      a.origenCultural.toLowerCase().includes(this.filtroTipo.toLowerCase())
    );
  }
}
