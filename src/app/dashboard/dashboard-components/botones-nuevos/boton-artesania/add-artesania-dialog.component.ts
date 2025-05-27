import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServicioArtesaniaService } from 'src/app/material-component/servicio-artesania/servicio-artesania.service';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';

@Component({
  selector: 'app-add-artesania-dialog',
  standalone: true,
  templateUrl: './add-artesania-dialog.component.html',
  imports: [CommonModule, ReactiveFormsModule, DemoMaterialModule]
})
export class AddArtesaniaDialogComponent {
  form: FormGroup;
  niveles = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddArtesaniaDialogComponent>,
    private artesaniaService: ServicioArtesaniaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      tipoArtesania: ['', Validators.required],
      nivelDificultad: ['', Validators.required],
      duracionTaller: [0, Validators.required],
      incluyeMaterial: [false],
      artesania: ['', Validators.required],
      origenCultural: ['', Validators.required],
      maxParticipantes: [1, Validators.required],
      visitaTaller: [false],
      artesano: ['', Validators.required],
      servicio: [null, Validators.required]
    });
  }

  guardar() {
    if (this.form.valid) {
      this.artesaniaService.createArtesania(this.form.value).subscribe({
        next: () => this.dialogRef.close('refresh'),
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
