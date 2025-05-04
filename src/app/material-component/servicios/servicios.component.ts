import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiciosService } from './servicios.service';
import { TipoServicioService } from './tipo-servicio.service';

// Angular Material
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
  tiposServicio: any[] = [];
  editando = false;
  servicioEditandoId: number | null = null;
  displayedColumns: string[] = ['nombreServicio', 'descripcion', 'precioBase', 'estado', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private serviciosService: ServiciosService,
    private tipoServicioService: TipoServicioService
  ) {}

  ngOnInit(): void {
    this.servicioForm = this.fb.group({
      nombreServicio: ['', Validators.required],
      descripcion: ['', Validators.required],
      precioBase: [null, [Validators.required, Validators.min(0)]],
      estado: ['ACTIVO', Validators.required],
      tipo: [null, Validators.required],

    });

    this.obtenerServicios();
    this.obtenerTiposServicio();
  }

  obtenerServicios(): void {
    this.serviciosService.getServicios().subscribe((data) => {
      this.servicios = data;
    });
  }

  obtenerTiposServicio(): void {
    this.tipoServicioService.getTipos().subscribe((data) => {
      this.tiposServicio = data;
    });
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) return;

    const payload = { ...this.servicioForm.value };

    if (this.editando && this.servicioEditandoId != null) {
      this.serviciosService.updateServicio(this.servicioEditandoId, payload).subscribe(() => {
        this.obtenerServicios();
        this.cancelarEdicion();
      });
    } else {
      this.serviciosService.createServicio(payload).subscribe(() => {
        this.obtenerServicios();
        this.servicioForm.reset({ estado: 'ACTIVO' });
      });
    }
  }

  editarServicio(servicio: any): void {
    this.editando = true;
    this.servicioEditandoId = servicio.idServicio;

    this.servicioForm.setValue({
      nombreServicio: servicio.nombreServicio,
      descripcion: servicio.descripcion,
      precioBase: servicio.precioBase,
      estado: servicio.estado,
      tipo: servicio.tipo?.idTipo // <- importante
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.servicioEditandoId = null;
    this.servicioForm.reset({ estado: 'ACTIVO' });
  }

  eliminarServicio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.serviciosService.deleteServicio(id).subscribe(() => {
        this.obtenerServicios();
      });
    }
  }
}
