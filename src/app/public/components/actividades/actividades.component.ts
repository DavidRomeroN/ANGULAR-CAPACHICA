import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActividadService } from '../../../material-component/actividades/actividades.service';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.scss']
})
export class ActividadesComponent implements OnInit {
  actividades: any[] = [];
  climaRecomendadas: any[] = [];
  mensajeClima = '';
  error: string | null = null;
  isLoading = true;
  isLoadingClima = false;

  fechasSugeridas: { fecha: string, label: string }[] = [];
  fechaSeleccionada: string | null = null;
  filtroNombre = '';

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  constructor(private actividadService: ActividadService) {}

  ngOnInit(): void {
    this.generarFechas();
    if (this.fechasSugeridas.length > 0) {
      this.seleccionarFecha(this.fechasSugeridas[0].fecha);
    }
  }

  generarFechas(): void {
    const hoy = new Date();
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      const iso = fecha.toISOString().split('T')[0];
      const diaNombre = dias[fecha.getDay()];
      const label = i === 0 ? `Hoy (${fecha.getDate()} ${meses[fecha.getMonth()]})`
        : i === 1 ? `Mañana (${fecha.getDate()} ${meses[fecha.getMonth()]})`
          : `${diaNombre} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;

      this.fechasSugeridas.push({ fecha: iso, label });
    }
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada = fecha;
    this.isLoadingClima = true;
    this.climaRecomendadas = [];
    this.mensajeClima = '';
    this.error = null;

    const index = this.fechasSugeridas.findIndex(f => f.fecha === fecha);
    if (index === -1) return;

    this.actividadService.getRecomendadas(index).subscribe({
      next: (res: any) => {
        this.climaRecomendadas = res.actividades || [];
        const label = this.fechasSugeridas[index].label;
        this.mensajeClima = this.climaRecomendadas.length > 0
          ? `☀️ ¡${this.climaRecomendadas.length} actividades ideales para ${label}!`
          : `🌧️ No hay actividades recomendadas para ${label}.`;
        this.isLoadingClima = false;
      },
      error: (err: any) => {
        this.error = 'No se pudo cargar las actividades.';
        this.isLoadingClima = false;
        console.error('Error al cargar actividades:', err);
      }
    });
  }

  actividadesFiltradas(): any[] {
    return this.climaRecomendadas.filter(a =>
      a.titulo?.toLowerCase().includes(this.filtroNombre.toLowerCase().trim())
    );
  }

  limpiarFiltro(): void {
    this.filtroNombre = '';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/actividad-placeholder.jpg';
  }

  scrollLeft(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}
