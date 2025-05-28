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
      next: (data) => {
        // Mapear id_paquete => id para que Angular pueda usarlo
        this.paquetes = data.map(p => ({
          ...p,
          id: p.idPaquete

      }));
      },
      error: (err) => {
        console.error('Error al cargar paquetes:', err);
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
    console.log('Hiciste clic en VER MÁS con ID:', id); // <--- agrega esto

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
      const coincideNombre = paquete.titulo.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideFecha = this.filtroFecha
        ? new Date(paquete.fechaInicio) >= new Date(this.filtroFecha)
        : true;
      const tieneCupos = paquete.cuposMaximos > 0;  // <-- Filtrar solo paquetes con cupos disponibles

      return coincideNombre && coincideFecha && tieneCupos;
    });
  }




}
