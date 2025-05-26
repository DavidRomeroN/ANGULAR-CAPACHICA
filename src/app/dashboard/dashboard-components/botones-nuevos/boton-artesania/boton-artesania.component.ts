import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddArtesaniaDialogComponent } from './add-artesania-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-boton-artesania',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="boton-rapido" (click)="abrirDialogo()">
      <div class="icono">
        <mat-icon>handyman</mat-icon>
      </div>
      <div class="titulo">Artesanía</div>
    </div>
  `,
  styleUrls: ['./boton-artesania.component.scss']
})
export class BotonArtesaniaComponent {
  constructor(private dialog: MatDialog) {}

  abrirDialogo(): void {
    this.dialog.open(AddArtesaniaDialogComponent, {
      width: '600px'
    });
  }
}
