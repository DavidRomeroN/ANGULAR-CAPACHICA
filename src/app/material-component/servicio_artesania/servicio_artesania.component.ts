import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { ServicioArtesaniaService } from './servicio_artesania.service';

@Component({
  selector: 'app-servicio-artesania',
  standalone: true,
  templateUrl: './servicio_artesania.component.html',
  styleUrls: ['./servicio_artesania.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ]
})
export class ServicioArtesaniaComponent implements OnInit {
  artesaniaForm!: FormGroup;
  artesanias: any[] = [];
  servicios: any[] = [];
  editando = false;
  editId: number | null = null;

  columnas = [
    { key: 'tipoArtesania', label: 'Tipo de Artesanía' },
    { key: 'nivelDificultad', label: 'Nivel' },
    { key: 'duracionTaller', label: 'Duración' },
    { key: 'incluyeMaterial', label: 'Material' },
    { key: 'artesania', label: 'Descripción' },
    { key: 'origenCultural', label: 'Origen Cultural' },
    { key: 'maxParticipantes', label: 'Participantes' },
    { key: 'visitaTaller', label: 'Visita' },
    { key: 'artesano', label: 'Artesano' }
  ];

// Agregamos "acciones" manualmente una sola vez
  colKeys = [...this.columnas.map(c => c.key), 'acciones'];


  formFields: {
    name: string;
    label: string;
    type: 'text' | 'select';
    options?: { value: string | boolean; label: string }[];
  }[] = [
    { name: 'tipoArtesania', label: 'Tipo de Artesanía', type: 'text' },
    { name: 'nivelDificultad', label: 'Nivel de Dificultad', type: 'select', options: [
        { value: 'PRINCIPIANTE', label: 'Principiante' },
        { value: 'INTERMEDIO', label: 'Intermedio' },
        { value: 'AVANZADO', label: 'Avanzado' }
      ]},
    { name: 'duracionTaller', label: 'Duración Taller', type: 'text' },
    { name: 'incluyeMaterial', label: 'Incluye Material', type: 'select', options: [
        { value: true, label: 'Sí' },
        { value: false, label: 'No' }
      ]},
    { name: 'artesania', label: 'Descripción de Artesanía', type: 'text' },
    { name: 'origenCultural', label: 'Origen Cultural', type: 'text' },
    { name: 'maxParticipantes', label: 'Máx Participantes', type: 'text' },
    { name: 'visitaTaller', label: 'Visita Taller', type: 'select', options: [
        { value: true, label: 'Sí' },
        { value: false, label: 'No' }
      ]},
    { name: 'artesano', label: 'Nombre del Artesano', type: 'text' }
  ];

  constructor(private fb: FormBuilder, private artesaniaService: ServicioArtesaniaService) {}

  ngOnInit(): void {
    this.artesaniaForm = this.fb.group({
      tipoArtesania: ['', Validators.required],
      nivelDificultad: ['', Validators.required],
      duracionTaller: [null, Validators.required],
      incluyeMaterial: [false, Validators.required],
      artesania: ['', Validators.required],
      origenCultural: ['', Validators.required],
      maxParticipantes: [null, Validators.required],
      visitaTaller: [false, Validators.required],
      artesano: ['', Validators.required],
      servicio: [null, Validators.required]
    });

    this.getArtesanias();
    this.artesaniaService.getServicios().subscribe(data => this.servicios = data);
  }

  getArtesanias(): void {
    this.artesaniaService.getAll().subscribe(data => this.artesanias = data);
  }

  guardar(): void {
    if (this.artesaniaForm.invalid) return;

    const dto = this.artesaniaForm.value;
    if (this.editando && this.editId !== null) {
      this.artesaniaService.update(this.editId, dto).subscribe(() => {
        this.getArtesanias();
        this.cancelar();
      });
    } else {
      this.artesaniaService.create(dto).subscribe(() => {
        this.getArtesanias();
        this.artesaniaForm.reset({ incluyeMaterial: false, visitaTaller: false });
      });
    }
  }

  editar(item: any): void {
    this.editando = true;
    this.editId = item.idArtesania;
    this.artesaniaForm.setValue({
      tipoArtesania: item.tipoArtesania,
      nivelDificultad: item.nivelDificultad,
      duracionTaller: item.duracionTaller,
      incluyeMaterial: item.incluyeMaterial,
      artesania: item.artesania,
      origenCultural: item.origenCultural,
      maxParticipantes: item.maxParticipantes,
      visitaTaller: item.visitaTaller,
      artesano: item.artesano,
      servicio: item.servicio?.idServicio
    });
  }

  cancelar(): void {
    this.editando = false;
    this.editId = null;
    this.artesaniaForm.reset({ incluyeMaterial: false, visitaTaller: false });
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      this.artesaniaService.delete(id).subscribe(() => this.getArtesanias());
    }
  }
}
