import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DestinosService} from "../../../material-component/destinos/destinos.service";
import { Router } from '@angular/router';

interface Destino {
  idDestino: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  imagenUrl: string;
  popularidad: number;
}

@Component({
  selector: 'app-destinos',
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.scss']
})
export class DestinosComponent implements OnInit {

  destinos: Destino[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private destinosService: DestinosService, private router: Router) {}

  verMasDestino(id: number): void {
    this.router.navigate(['/capachica/detalle-destino', id]);
  }
  ngOnInit(): void {
    this.destinosService.getAll().subscribe({
      next: (data) => {
        this.destinos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando destinos', err);
        this.error = 'Error al cargar destinos.';
        this.isLoading = false;
      }
    });
  }

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  scrollLeft(): void {
    this.scrollContainer.nativeElement.scrollLeft -= 300;
  }

  scrollRight(): void {
    this.scrollContainer.nativeElement.scrollLeft += 300;
  }

}
