import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiciosService } from './servicios.service';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ]
})
export class ServiciosComponent implements OnInit {
  servicioForm!: FormGroup;
  servicios: any[] = [];
  editando = false;
  servicioEditandoId: number | null = null;

  // Declarar la propiedad formVisible
  formVisible: boolean = false;

  // 👇 Usa las propiedades del backend (camelCase)
  displayedColumns: string[] = ['nombreServicio', 'descripcion', 'precioBase', 'estado', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private serviciosService: ServiciosService
  ) {}

  ngOnInit(): void {
    this.servicioForm = this.fb.group({
      nombreServicio: ['', Validators.required],
      descripcion: ['', Validators.required],
      precioBase: [null, [Validators.required, Validators.min(0)]],
      estado: ['ACTIVO', Validators.required],
      tipo: [null, Validators.required] // 👈 obligatorio, el backend lo espera
    });

    this.obtenerServicios();
  }

  obtenerServicios(): void {
    this.serviciosService.getServicios().subscribe((data) => {
      this.servicios = data;
    });
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) return;

    const data = { ...this.servicioForm.value };

    // Solo si estás editando, agrega el ID
    if (this.editando && this.servicioEditandoId !== null) {
      data.idServicio = this.servicioEditandoId;
      this.serviciosService.updateServicio(this.servicioEditandoId, data).subscribe(() => {
        this.obtenerServicios();
        this.cancelarEdicion();
      });
    } else {
      this.serviciosService.createServicio(data).subscribe(() => {
        this.obtenerServicios();
        this.servicioForm.reset({ estado: 'ACTIVO' });
      });
    }
  }

  editarServicio(servicio: any): void {
    this.editando = true;
    this.servicioEditandoId = servicio.idServicio;
    this.formVisible = true;  // Mostrar el formulario cuando se edita un servicio

    this.servicioForm.setValue({
      nombreServicio: servicio.nombreServicio,
      descripcion: servicio.descripcion,
      precioBase: servicio.precioBase,
      estado: servicio.estado,
      tipo: servicio.tipo.idTipo // 👈 asumiendo que servicio.tipo es un objeto
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.servicioEditandoId = null;
    this.servicioForm.reset({ estado: 'ACTIVO' });
    this.formVisible = false;  // Ocultar el formulario cuando se cancela la edición
  }

  eliminarServicio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.serviciosService.deleteServicio(id).subscribe(() => {
        this.obtenerServicios();
      });
    }
  }
}
