import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicioHoteleriaService } from './servicio-hoteleria.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

@Component({
  standalone: true,
  selector: 'app-servicio-hoteleria',
  templateUrl: './servicio-hoteleria.component.html',
  styleUrls: ['./servicio-hoteleria.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatOptionModule
  ]
})
export class ServicioHoteleriaComponent implements OnInit {
  hoteleriaForm!: FormGroup;
  hoteles: any[] = [];
  editando = false;
  hotelEditandoId: number | null = null;

  desayunoOpciones = ['Si', 'No'];

  displayedColumns: string[] = [
    'tipoHabitacion',
    'estrellas',
    'incluyeDesayuno',
    'maxPersonas',
    'servicio',
    'acciones'
  ];

  constructor(
    private fb: FormBuilder,
    private servicioHoteleriaService: ServicioHoteleriaService
  ) {}

  ngOnInit(): void {
    this.hoteleriaForm = this.fb.group({
      tipoHabitacion: ['', Validators.required],
      estrellas: [1, [Validators.required, Validators.min(1)]],
      incluyeDesayuno: ['Si', Validators.required],
      maxPersonas: [1, [Validators.required, Validators.min(1)]],
      servicio: [null, Validators.required]
    });

    this.obtenerHoteles();
  }

  obtenerHoteles(): void {
    this.servicioHoteleriaService.getHoteleria().subscribe(data => {
      this.hoteles = data;
    });
  }

  guardarHotel(): void {
    if (this.hoteleriaForm.invalid) return;

    const data = { ...this.hoteleriaForm.value };

    if (this.editando && this.hotelEditandoId !== null) {
      this.servicioHoteleriaService.updateHoteleria(this.hotelEditandoId, data).subscribe(() => {
        this.obtenerHoteles();
        this.cancelarEdicion();
      });
    } else {
      this.servicioHoteleriaService.createHoteleria(data).subscribe(() => {
        this.obtenerHoteles();
        this.hoteleriaForm.reset({ incluyeDesayuno: 'Si' });
      });
    }
  }

  editarHotel(h: any): void {
    this.editando = true;
    this.hotelEditandoId = h.idHoteleria;

    this.hoteleriaForm.setValue({
      tipoHabitacion: h.tipoHabitacion,
      estrellas: h.estrellas,
      incluyeDesayuno: h.incluyeDesayuno,
      maxPersonas: h.maxPersonas,
      servicio: h.servicio.idServicio
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.hotelEditandoId = null;
    this.hoteleriaForm.reset({ incluyeDesayuno: 'Si' });
  }

  eliminarHotel(id: number): void {
    if (confirm('¿Eliminar este servicio hotelero?')) {
      this.servicioHoteleriaService.deleteHoteleria(id).subscribe(() => {
        this.obtenerHoteles();
      });
    }
  }
}
