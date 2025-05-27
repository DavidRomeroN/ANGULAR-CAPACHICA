import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPaqueteDialogComponent } from './add-paquete-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boton-paquetes',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './boton-paquetes.component.html',
  styleUrls: ['./boton-paquetes.component.scss']
})
export class BotonPaquetesComponent {
  constructor(private dialog: MatDialog) {}

  abrirDialogo(): void {
    this.dialog.open(AddPaqueteDialogComponent, {
      width: '700px'
    });
  }
}
