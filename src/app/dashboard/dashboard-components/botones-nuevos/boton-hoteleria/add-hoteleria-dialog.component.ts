import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServicioHoteleriaService } from 'src/app/material-component/servicio-hoteleria/servicio-hoteleria.service';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';

@Component({
  selector: 'app-add-hoteleria-dialog',
  standalone: true,
  templateUrl: './add-hoteleria-dialog.component.html',
  imports: [CommonModule, ReactiveFormsModule, DemoMaterialModule]
})
export class AddHoteleriaDialogComponent {
  form: FormGroup;
  desayunoOpciones = ['Si', 'No'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddHoteleriaDialogComponent>,
    private hoteleriaService: ServicioHoteleriaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      tipoHabitacion: ['', Validators.required],
      estrellas: [1, [Validators.required, Validators.min(1)]],
      incluyeDesayuno: ['Si', Validators.required],
      maxPersonas: [1, [Validators.required, Validators.min(1)]],
      servicio: [null, Validators.required]
    });
  }

  guardar() {
    if (this.form.valid) {
      this.hoteleriaService.createHoteleria(this.form.value).subscribe({
        next: () => this.dialogRef.close('refresh'),
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
