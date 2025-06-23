import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PaquetesService } from '../../../material-component/paquetes/paquetes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.scss']
})
export class PaquetesComponent implements OnInit {
  paquetes: any[] = [];

  @ViewChild('paqueteContainer', { static: false }) paqueteContainer!: ElementRef;

  constructor(
    private paquetesService: PaquetesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.paquetesService.getAll().subscribe({
      next: (response) => {
        // ✅ Validar que el backend respondió correctamente
        if (response && Array.isArray(response.content)) {
          this.paquetes = response.content.map((item: any) => ({
            ...item.data,
            id: item.data?.idPaquete
          }));
        } else {
          console.warn('Respuesta inesperada de /paquetes:', response);
          this.paquetes = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar paquetes:', err);
        this.paquetes = [];
      }
    });
  }

  scrollPaquetes(direction: 'left' | 'right'): void {
    const container = this.paqueteContainer.nativeElement;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  verDetalle(id: number): void {
    console.log('Hiciste clic en VER MÁS con ID:', id);

    if (id) {
      this.router.navigate(['/capachica/detalle-paquete', id]);
    } else {
      console.error('El paquete no tiene ID definido');
    }
  }

  filtroNombre: string = '';
  filtroFecha: string = ''; // formato: YYYY-MM-DD

  paquetesFiltrados(): any[] {
    return this.paquetes.filter(paquete => {
      const coincideNombre = paquete.titulo?.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideFecha = this.filtroFecha
        ? new Date(paquete.fechaInicio) >= new Date(this.filtroFecha)
        : true;
      const tieneCupos = paquete.cuposMaximos > 0;

      return coincideNombre && coincideFecha && tieneCupos;
    });
  }
}
