import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { PaquetesService } from 'src/app/material-component/paquetes/paquetes.service';

@Component({
  selector: 'app-add-paquete-dialog',
  standalone: true,
  templateUrl: './add-paquete-dialog.component.html',
  imports: [CommonModule, ReactiveFormsModule, DemoMaterialModule]
})
export class AddPaqueteDialogComponent {
  form: FormGroup;
  minDate: string = new Date().toISOString().split('T')[0];
  estadoOpciones = ['DISPONIBLE', 'AGOTADO'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPaqueteDialogComponent>,
    private paqueteService: PaquetesService
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagenUrl: ['', Validators.required],
      precioTotal: [null, [Validators.required, Validators.min(0)]],
      estado: ['DISPONIBLE', Validators.required],
      duracionDias: [null, [Validators.required, Validators.min(1)]],
      localidad: ['', Validators.required],
      tipoActividad: ['', Validators.required],
      cuposMaximos: [null, [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      proveedorId: [null, Validators.required],
      destinoId: [null, Validators.required]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const formData = new FormData();

    formData.append('titulo', formValue.titulo);
    formData.append('descripcion', formValue.descripcion);
    formData.append('imagenUrl', formValue.imagenUrl);
    formData.append('precioTotal', formValue.precioTotal.toString());
    formData.append('estado', formValue.estado);
    formData.append('duracionDias', formValue.duracionDias.toString());
    formData.append('localidad', formValue.localidad);
    formData.append('tipoActividad', formValue.tipoActividad);
    formData.append('cuposMaximos', formValue.cuposMaximos.toString());
    formData.append('fechaInicio', this.formatFecha(formValue.fechaInicio));
    formData.append('fechaFin', this.formatFecha(formValue.fechaFin));
    formData.append('proveedor', formValue.proveedorId.toString());
    formData.append('destino', formValue.destinoId.toString());

    this.paqueteService.create(formData).subscribe({
      next: () => this.dialogRef.close('refresh'),
      error: (err) => console.error('Error al crear paquete:', err)
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private formatFecha(fecha: any): string {
    const date = new Date(fecha);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')} 00:00:00`;
  }
}
