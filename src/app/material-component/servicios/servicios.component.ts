import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import {ServiciosService} from "./servicios.service";
import {TipoServicioService} from "../tipo-servicio/TipoServicioService";

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
  tipoForm!: FormGroup;
  servicios: any[] = [];
  tipos: any[] = [];

  formVisible = false;
  tipoFormVisible = false;
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
      tipo: [null, Validators.required]
    });

    this.tipoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    this.obtenerServicios();
    this.obtenerTipos();
  }

  obtenerServicios(): void {
    this.serviciosService.getServicios().subscribe(data => {
      this.servicios = data;
    });
  }

  obtenerTipos(): void {
    this.tipoServicioService.getTipos().subscribe(data => {
      this.tipos = data;
    });
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) return;

    const data = { ...this.servicioForm.value };

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
        this.formVisible = false;
      });
    }
  }

  guardarTipoServicio(): void {
    if (this.tipoForm.invalid) return;

    const nuevoTipo = this.tipoForm.value;

    this.tipoServicioService.createTipo(nuevoTipo).subscribe(() => {
      this.obtenerTipos();
      this.tipoForm.reset();
      this.tipoFormVisible = false;
    });
  }

  editarServicio(servicio: any): void {
    this.editando = true;
    this.servicioEditandoId = servicio.idServicio;
    this.formVisible = true;

    this.servicioForm.setValue({
      nombreServicio: servicio.nombreServicio,
      descripcion: servicio.descripcion,
      precioBase: servicio.precioBase,
      estado: servicio.estado,
      tipo: servicio.tipo.idTipo
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.servicioEditandoId = null;
    this.servicioForm.reset({ estado: 'ACTIVO' });
    this.formVisible = false;
  }

  eliminarServicio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.serviciosService.deleteServicio(id).subscribe(() => {
        this.obtenerServicios();
      });
    }
  }
}
