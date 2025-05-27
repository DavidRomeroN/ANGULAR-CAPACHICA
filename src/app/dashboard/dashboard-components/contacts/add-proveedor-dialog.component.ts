import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { ProveedoresService } from '../../../material-component/proveedores/proveedores.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-add-proveedor-dialog',
  standalone: true,
  templateUrl: './add-proveedor-dialog.component.html',

  imports: [DemoMaterialModule, ReactiveFormsModule],
})
export class AddProveedorDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProveedorDialogComponent>,
    private proveedorService: ProveedoresService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
    });

    if (data) {
      this.form.patchValue({
        nombre: data.nombreCompleto,
        email: data.email,
        telefono: data.telefono
      });
    }
  }


  guardar() {
    if (this.form.valid) {
      const usuarioLogueado = localStorage.getItem('usuarioLogueado');
      const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;

      if (!usuario || !usuario.idUsuario) {
        console.error('Usuario no logueado');
        return;
      }

      const fechaPeru = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
      const fecha = new Date(fechaPeru);
      const fechaFormateada = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')} ${fecha
        .getHours()
        .toString()
        .padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;

      const proveedor = {
        nombreCompleto: this.form.value.nombre,
        email: this.form.value.email,
        telefono: this.form.value.telefono,
        fechaRegistro: fechaFormateada,
        usuario: usuario.idUsuario
      };

      if (this.data && this.data.idProveedor) {
        // 👉 Estamos editando
        this.proveedorService.update(this.data.idProveedor, proveedor).subscribe({
          next: () => this.dialogRef.close('refresh'),
          error: (err) => console.error('Error al actualizar:', err)
        });
      } else {
        // 👉 Estamos creando
        this.proveedorService.create(proveedor).subscribe({
          next: () => this.dialogRef.close('refresh'),
          error: (err) => console.error('Error al crear:', err)
        });
      }
    }
  }


  cancelar() {
    this.dialogRef.close();
  }
}
