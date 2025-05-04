import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicioHoteleriaService } from './servicio_hoteleria.service';
import { HttpClientModule } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-servicio-hoteleria',
  templateUrl: './servicio_hoteleria.component.html',
  styleUrls: ['./servicio_hoteleria.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ]
})
export class ServicioHoteleriaComponent implements OnInit {
  hoteleriaForm!: FormGroup;
  hoteles: any[] = [];
  servicios: any[] = [];
  editando = false;
  idEditando: number | null = null;

  displayedColumns: string[] = ['tipoHabitacion', 'estrellas', 'incluyeDesayuno', 'maxPersonas', 'nombreServicio', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private hoteleriaService: ServicioHoteleriaService
  ) {}

  ngOnInit(): void {
    this.hoteleriaForm = this.fb.group({
      tipoHabitacion: ['', Validators.required],
      estrellas: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      incluyeDesayuno: ['NO', Validators.required],
      maxPersonas: [1, [Validators.required, Validators.min(1)]],
      servicio: [null, Validators.required]
    });

    this.obtenerHoteles();
    this.obtenerServicios();
  }

  obtenerHoteles(): void {
    this.hoteleriaService.getAll().subscribe({
      next: data => this.hoteles = data,
      error: err => console.error('Error al obtener hoteles:', err)
    });
  }

  obtenerServicios(): void {
    this.hoteleriaService.getServicios().subscribe({
      next: data => {
        this.servicios = data;
        console.log('Servicios disponibles:', data);
      },
      error: err => console.error('Error al obtener servicios:', err)
    });
  }

  guardar(): void {
    if (this.hoteleriaForm.invalid) return;

    const raw = this.hoteleriaForm.value;

    const dto = {
      idHoteleria: this.idEditando ?? null,
      tipoHabitacion: raw.tipoHabitacion,
      estrellas: Number(raw.estrellas),
      incluyeDesayuno: raw.incluyeDesayuno === 'SI' ? 'SI' : 'NO',
      maxPersonas: Number(raw.maxPersonas),
      servicio: Number(raw.servicio)
    };

    console.log('DTO enviado al backend:', JSON.stringify(dto, null, 2));

    const request = this.editando && this.idEditando !== null
      ? this.hoteleriaService.update(this.idEditando, dto)
      : this.hoteleriaService.create(dto);

    request.subscribe({
      next: () => {
        this.obtenerHoteles();
        this.cancelar();
      },
      error: err => console.error('Error al guardar:', err)
    });
  }

  editar(hotel: any): void {
    this.editando = true;
    this.idEditando = hotel.idHoteleria;

    this.hoteleriaForm.setValue({
      tipoHabitacion: hotel.tipoHabitacion,
      estrellas: hotel.estrellas,
      incluyeDesayuno: hotel.incluyeDesayuno,
      maxPersonas: hotel.maxPersonas,
      servicio: hotel.servicio?.idServicio
    });
  }

  cancelar(): void {
    this.editando = false;
    this.idEditando = null;
    this.hoteleriaForm.reset({
      tipoHabitacion: '',
      estrellas: 1,
      incluyeDesayuno: 'NO',
      maxPersonas: 1,
      servicio: null
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este hotel?')) {
      this.hoteleriaService.delete(id).subscribe(() => this.obtenerHoteles());
    }
  }
}
