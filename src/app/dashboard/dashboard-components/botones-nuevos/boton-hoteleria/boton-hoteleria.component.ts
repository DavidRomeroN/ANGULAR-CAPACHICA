import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddHoteleriaDialogComponent } from './add-hoteleria-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-boton-hoteleria',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="boton-rapido" (click)="abrirDialogo()">
      <div class="icono">
        <mat-icon>hotel</mat-icon>
      </div>
      <div class="titulo">Hotelería</div>
    </div>
  `,
  styleUrls: ['./boton-hoteleria.component.scss']
})
export class BotonHoteleriaComponent {
  constructor(private dialog: MatDialog) {}

  abrirDialogo(): void {
    this.dialog.open(AddHoteleriaDialogComponent, {
      width: '600px'
    });
  }
}
