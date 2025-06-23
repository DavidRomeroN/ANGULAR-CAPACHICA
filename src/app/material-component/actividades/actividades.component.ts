import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule  } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule  } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { ActividadService } from './actividades.service';
import { MatTableDataSource } from '@angular/material/table';

import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,        // <-- ✅ Agregado
    MatOptionModule
  ],
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.scss']
})
export class ActividadesComponent implements OnInit {
  actividades = new MatTableDataSource<any>();
  actividadForm!: FormGroup;
  formularioVisible = false;
  editando = false;
  idActividadEditando: number | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  displayedColumns: string[] = ['titulo', 'descripcion', 'tipo', 'duracionHoras', 'precioBase', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private actividadesService: ActividadService
  ) {}

  ngOnInit(): void {
    this.actividadForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required],
      duracionHoras: ['', [Validators.required, Validators.min(1)]],
      precioBase: ['', [Validators.required, Validators.min(0)]]
    });

    this.cargarActividades();
  }

  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) {
      this.resetForm();
    }
  }

  cargarActividades(): void {
    this.actividadesService.getAll().subscribe({
      next: data => this.actividades.data = data,
      error: () => this.errorMessage = 'Error al cargar actividades.'
    });
  }

  guardar(): void {
    if (this.actividadForm.invalid) return;

    const dto = this.actividadForm.value;
    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (this.editando && this.idActividadEditando !== null) {
      if (this.selectedFile) {
        formData.append('imagenFile', this.selectedFile);
      }
      this.actividadesService.update(this.idActividadEditando, formData).subscribe({
        next: () => {
          this.resetForm();
          this.cargarActividades();
        },
        error: err => this.errorMessage = err.error?.error || 'Error al actualizar.'
      });
    } else {
      if (!this.selectedFile) {
        this.errorMessage = 'Debe seleccionar una imagen.';
        return;
      }
      formData.append('imagenFile', this.selectedFile);
      this.actividadesService.create(formData).subscribe({
        next: () => {
          this.resetForm();
          this.cargarActividades();
        },
        error: err => this.errorMessage = err.error?.error || 'Error al crear.'
      });
    }
  }

  editar(a: any): void {
    this.editando = true;
    this.formularioVisible = true;
    this.idActividadEditando = a.idActividad;
    this.actividadForm.patchValue({
      titulo: a.titulo,
      descripcion: a.descripcion,
      tipo: a.tipo,
      duracionHoras: a.duracionHoras,
      precioBase: a.precioBase
    });
    this.selectedFile = null;
  }

  eliminar(id: number): void {
    if (!confirm('¿Deseas eliminar esta actividad?')) return;
    this.actividadesService.delete(id).subscribe({
      next: () => this.cargarActividades(),
      error: () => this.errorMessage = 'Error al eliminar.'
    });
  }

  resetForm(): void {
    this.actividadForm.reset();
    this.formularioVisible = false;
    this.editando = false;
    this.idActividadEditando = null;
    this.selectedFile = null;
    this.errorMessage = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && ['image/jpeg','image/png','image/jpg'].includes(file.type)) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Tipo de imagen inválido.';
    }
  }

  tiposActividad: string[] = [
    'CULTURAL',
    'ENTRETENIMIENTO',
    'RELAJANTE',
    'AVENTURA',
    'GASTRONOMICO',
    'ACUATICO',
    'FOTOGRAFIA',
    'RELIGIOSO'
  ];

}
