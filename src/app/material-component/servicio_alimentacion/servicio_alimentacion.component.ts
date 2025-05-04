import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { ServicioAlimentacionService } from './servicio_alimentacion.service';

@Component({
  selector: 'app-servicio-alimentacion',
  standalone: true,
  templateUrl: './servicio_alimentacion.component.html',
  styleUrls: ['./servicio_alimentacion.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ]
})
export class ServicioAlimentacionComponent implements OnInit {
  alimentacionForm!: FormGroup;
  alimentaciones: any[] = [];
  editando = false;
  editId: number | null = null;
  servicios: any[] = [];


  constructor(
    private fb: FormBuilder,
    private alimentacionService: ServicioAlimentacionService
  ) {}

  ngOnInit(): void {
    this.alimentacionForm = this.fb.group({
      tipoComida: ['', Validators.required],
      estiloGastronomico: ['', Validators.required],
      incluyeBebidas: ['NO', Validators.required],
      servicio: [null, Validators.required]
    });

    this.getAlimentaciones();
    this.alimentacionService.getServicios().subscribe(data => this.servicios = data);

  }

  getAlimentaciones(): void {
    this.alimentacionService.getAll().subscribe(data => this.alimentaciones = data);
  }

  guardar(): void {
    if (this.alimentacionForm.invalid) return;

    const dto = this.alimentacionForm.value;
    if (this.editando && this.editId !== null) {
      this.alimentacionService.update(this.editId, dto).subscribe(() => {
        this.getAlimentaciones();
        this.cancelar();
      });
    } else {
      this.alimentacionService.create(dto).subscribe(() => {
        this.getAlimentaciones();
        this.alimentacionForm.reset({ incluyeBebidas: 'NO' });
      });
    }
  }

  editar(item: any): void {
    this.editando = true;
    this.editId = item.idAlimentacion;
    this.alimentacionForm.setValue({
      tipoComida: item.tipoComida,
      estiloGastronomico: item.estiloGastronomico,
      incluyeBebidas: item.incluyeBebidas,
      servicio: item.servicio?.idServicio
    });
  }

  cancelar(): void {
    this.editando = false;
    this.editId = null;
    this.alimentacionForm.reset({ incluyeBebidas: 'NO' });
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      this.alimentacionService.delete(id).subscribe(() => this.getAlimentaciones());
    }
  }
}
