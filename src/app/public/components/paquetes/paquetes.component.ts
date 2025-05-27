import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PaquetesService } from '../../../material-component/paquetes/paquetes.service';

@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.scss']
})
export class PaquetesComponent implements OnInit {
  paquetes: any[] = [];

  @ViewChild('paqueteContainer', { static: false }) paqueteContainer!: ElementRef;

  constructor(private paquetesService: PaquetesService) {}

  ngOnInit(): void {
    this.paquetesService.getAll().subscribe({
      next: (data) => {
        this.paquetes = data;
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
}
