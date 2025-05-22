import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaquetesService } from './paquetes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-paquetes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.scss']
})
export class PaquetesComponent implements OnInit {
  paquetes: any[] = [];
  paqueteForm!: FormGroup;
  editando = false;
  idPaqueteEditando: number | null = null;
  minDate: string;
  errorMessage: string = '';
  formularioVisible: boolean = false;

  proveedorNombre: string = '';
  destinoNombre: string = '';

  constructor(private paqueteService: PaquetesService, private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPaquetes();
  }

  getPaquetesPorMes(): Observable<any[]> {
    return this.paqueteService.getAll(); // Uso correcto
  }

  inicializarFormulario(): void {
    this.paqueteForm = this.fb.group({
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

    this.paqueteForm.get('proveedorId')?.valueChanges.subscribe(id => {
      if (id) this.buscarProveedorPorId(id);
      else this.proveedorNombre = '';
    });

    this.paqueteForm.get('destinoId')?.valueChanges.subscribe(id => {
      if (id) this.buscarDestinoPorId(id);
      else this.destinoNombre = '';
    });
  }

  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) this.resetForm();
  }

  cargarPaquetes(): void {
    this.paqueteService.getAll().subscribe({
      next: (data) => {
        this.paquetes = data;

        this.paquetes.forEach(paquete => {
          const proveedorId = typeof paquete.proveedor === 'number' ? paquete.proveedor : paquete.proveedor?.idProveedor;
          const destinoId = typeof paquete.destino === 'number' ? paquete.destino : paquete.destino?.idDestino;

          if (proveedorId) {
            this.paqueteService.getProveedorPorId(proveedorId).subscribe(
              proveedor => paquete.proveedor = proveedor,
              err => console.error(`Error proveedor ID ${proveedorId}`, err)
            );
          }

          if (destinoId) {
            this.paqueteService.getDestinoPorId(destinoId).subscribe(
              destino => paquete.destino = destino,
              err => console.error(`Error destino ID ${destinoId}`, err)
            );
          }
        });
      },
      error: err => {
        console.error('Error al cargar paquetes:', err);
        this.errorMessage = 'Error al cargar la lista de paquetes.';
      }
    });
  }

  buscarProveedorPorId(id: number): void {
    this.paqueteService.getProveedorPorId(id).subscribe({
      next: proveedor => this.proveedorNombre = proveedor.nombreCompleto || 'Nombre no disponible',
      error: err => {
        console.error('Error al buscar proveedor:', err);
        this.proveedorNombre = 'Proveedor no encontrado';
      }
    });
  }

  buscarDestinoPorId(id: number): void {
    this.paqueteService.getDestinoPorId(id).subscribe({
      next: destino => this.destinoNombre = destino.nombre || 'Nombre no disponible',
      error: err => {
        console.error('Error al buscar destino:', err);
        this.destinoNombre = 'Destino no encontrado';
      }
    });
  }

  buscarProveedor(): void {
    const id = this.paqueteForm.get('proveedorId')?.value;
    if (id) this.buscarProveedorPorId(id);
  }

  buscarDestino(): void {
    const id = this.paqueteForm.get('destinoId')?.value;
    if (id) this.buscarDestinoPorId(id);
  }

  guardar(): void {
    if (this.paqueteForm.invalid) {
      this.paqueteForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    this.errorMessage = '';
    const formValue = this.paqueteForm.value;

    const paquete = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      imagenUrl: formValue.imagenUrl,
      precioTotal: parseFloat(formValue.precioTotal),
      estado: formValue.estado,
      duracionDias: parseInt(formValue.duracionDias, 10),
      localidad: formValue.localidad,
      tipoActividad: formValue.tipoActividad,
      cuposMaximos: parseInt(formValue.cuposMaximos, 10),
      fechaInicio: this.formatFecha(formValue.fechaInicio),
      fechaFin: this.formatFecha(formValue.fechaFin),
      proveedor: parseInt(formValue.proveedorId, 10),
      destino: parseInt(formValue.destinoId, 10)
    };

    if (this.editando && this.idPaqueteEditando !== null) {
      this.paqueteService.update(this.idPaqueteEditando, paquete).subscribe({
        next: () => {
          this.resetForm();
          this.cargarPaquetes();
          this.formularioVisible = false;
        },
        error: err => {
          console.error('Error al actualizar paquete:', err);
          this.errorMessage = 'Error al actualizar el paquete. ' + (err.error?.message || '');
        }
      });
    } else {
      this.paqueteService.create(paquete).subscribe({
        next: () => {
          this.resetForm();
          this.cargarPaquetes();
          this.formularioVisible = false;
        },
        error: err => {
          console.error('Error al crear paquete:', err);
          this.errorMessage = 'Error al crear el paquete. ' + (err.error?.message || '');
        }
      });
    }
  }

  editar(paquete: any): void {
    this.editando = true;
    this.idPaqueteEditando = paquete.idPaquete;
    this.formularioVisible = true;

    const proveedorId = typeof paquete.proveedor === 'number' ? paquete.proveedor : paquete.proveedor?.idProveedor;
    const destinoId = typeof paquete.destino === 'number' ? paquete.destino : paquete.destino?.idDestino;

    this.paqueteForm.patchValue({
      titulo: paquete.titulo,
      descripcion: paquete.descripcion,
      imagenUrl: paquete.imagenUrl,
      precioTotal: paquete.precioTotal,
      estado: paquete.estado,
      duracionDias: paquete.duracionDias,
      localidad: paquete.localidad,
      tipoActividad: paquete.tipoActividad,
      cuposMaximos: paquete.cuposMaximos,
      fechaInicio: this.formatFechaForInput(paquete.fechaInicio),
      fechaFin: this.formatFechaForInput(paquete.fechaFin),
      proveedorId,
      destinoId
    });

    if (proveedorId) this.buscarProveedorPorId(proveedorId);
    if (destinoId) this.buscarDestinoPorId(destinoId);
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este paquete?')) {
      this.paqueteService.delete(id).subscribe({
        next: () => this.cargarPaquetes(),
        error: err => {
          console.error('Error al eliminar paquete:', err);
          this.errorMessage = 'Error al eliminar el paquete.';
        }
      });
    }
  }

  resetForm(): void {
    this.paqueteForm.reset({ estado: 'DISPONIBLE' });
    this.editando = false;
    this.idPaqueteEditando = null;
    this.errorMessage = '';
    this.proveedorNombre = '';
    this.destinoNombre = '';
  }

  private formatFecha(fecha: any): string {
    const date = new Date(fecha);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} 00:00:00`;
  }

  private formatFechaForInput(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }
}
