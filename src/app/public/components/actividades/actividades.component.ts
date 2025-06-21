import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActividadesService } from "../../../material-component/actividades/actividades.service";

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.scss']
})
export class ActividadesComponent implements OnInit {
  actividades: any[] = [];

  @ViewChild('actividadContainer', { static: false }) actividadContainer!: ElementRef;

  filtroNombre: string = '';
  defaultImage = 'assets/images/default-actividad.jpg';

  constructor(
    private actividadesService: ActividadesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.actividadesService.getAll().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); // Para debug
        // Mapear idActividad => id para Angular
        this.actividades = data.map(a => ({
          ...a,
          id: a.idActividad
        }));
      },
      error: (err) => {
        console.error('Error al cargar actividades:', err);
      }
    });
  }

  scrollActividades(direction: 'left' | 'right'): void {
    const container = this.actividadContainer.nativeElement;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  verDetalle(id: number): void {
    console.log('Hiciste clic en VER MÁS con ID:', id);

    if (id) {
      this.router.navigate(['/capachica/detalle-actividad', id]);
    } else {
      console.error('La actividad no tiene ID definido');
    }
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  actividadesFiltradas(): any[] {
    return this.actividades.filter(actividad => {
      const coincideNombre = actividad.titulo.toLowerCase().includes(this.filtroNombre.toLowerCase());
      // Removí el filtro de fecha y cupos ya que no están en tus datos
      return coincideNombre;
    });
  }
}
