import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ResenaService } from './resena.service';

@Component({
  selector: 'app-resena',
  standalone: true,
  templateUrl: './resena.component.html',
  styleUrls: ['./resena.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ResenaComponent implements OnInit {
  resenas: any[] = [];
  displayedColumns: string[] = ['usuario', 'paquete', 'comentario', 'fecha', 'acciones'];

  constructor(private resenaService: ResenaService) {}

  ngOnInit(): void {
    this.obtenerResenas();
  }

  obtenerResenas(): void {
    this.resenaService.getResenas().subscribe((data) => {
      this.resenas = data;
    });
  }

}
