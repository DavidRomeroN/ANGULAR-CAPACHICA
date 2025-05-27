import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServicioAlimentoService } from 'src/app/material-component/servicio_alimento/servicio-alimento.service';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';

@Component({
  selector: 'app-add-alimentacion-dialog',
  standalone: true,
  templateUrl: './add-alimentacion-dialog.component.html',
  imports: [CommonModule, ReactiveFormsModule, DemoMaterialModule]
})
export class AddAlimentacionDialogComponent {
  form: FormGroup;
  bebidas = ['SI', 'NO'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAlimentacionDialogComponent>,
    private alimentoService: ServicioAlimentoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      tipoComida: ['', Validators.required],
      estiloGastronomico: ['', Validators.required],
      incluyeBebidas: ['SI', Validators.required],
      servicio: [null, Validators.required]
    });
  }

  guardar() {
    if (this.form.valid) {
      const data = this.form.value;
      this.alimentoService.createAlimento(data).subscribe({
        next: () => this.dialogRef.close('refresh'),
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
