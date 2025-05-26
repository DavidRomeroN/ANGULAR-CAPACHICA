import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAlimentacionDialogComponent } from './add-alimentacion-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';

@Component({
  selector: 'app-boton-alimentacion',
  standalone: true,
  templateUrl: './boton-alimentacion.component.html',
  styleUrls: ['./boton-alimentacion.component.scss'],
  imports: [CommonModule, MatIconModule, DemoMaterialModule],
})
export class BotonAlimentacionComponent {
  constructor(private dialog: MatDialog) {}

  irAAlimentacion(): void {
    const dialogRef = this.dialog.open(AddAlimentacionDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'refresh') {
        // Aquí podrías emitir un evento si quieres notificar al dashboard
      }
    });
  }
}
