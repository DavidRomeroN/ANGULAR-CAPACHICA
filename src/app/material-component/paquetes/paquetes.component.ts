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
import { PaquetesService } from './paquetes.service';

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
    MatNativeDateModule
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

  // Variables para mostrar información de proveedor y destino
  proveedorNombre: string = '';
  destinoNombre: string = '';

  constructor(private paqueteService: PaquetesService, private fb: FormBuilder) {
    const today = new Date();
    this.minDate = this.formatDatetimeLocal(today);
  }

  ngOnInit(): void {
    this.paqueteForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagenUrl: ['', Validators.required],
      precioTotal: [null, [Validators.required, Validators.min(0)]],
      estado: ['', Validators.required],
      duracionDias: [null, [Validators.required, Validators.min(1)]],
      localidad: ['', Validators.required],
      tipoActividad: ['', Validators.required],
      cuposMaximos: [null, [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      proveedorId: [null, Validators.required],
      destinoId: [null, Validators.required]
    });

    // Subscribirse a cambios en los campos proveedorId y destinoId
    this.paqueteForm.get('proveedorId')?.valueChanges.subscribe(id => {
      if (id) {
        this.buscarProveedorPorId(id);
      } else {
        this.proveedorNombre = '';
      }
    });

    this.paqueteForm.get('destinoId')?.valueChanges.subscribe(id => {
      if (id) {
        this.buscarDestinoPorId(id);
      } else {
        this.destinoNombre = '';
      }
    });

    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.paqueteService.getAll().subscribe({
      next: (data: any[]) => {
        this.paquetes = data;

        // Cargar información adicional de proveedores y destinos
        this.paquetes.forEach(paquete => {
          const idProveedor = paquete.proveedor?.idProveedor;
          const idDestino = paquete.destino?.idDestino;

          if (idProveedor) {
            this.paqueteService.getProveedorPorId(idProveedor).subscribe(
              (proveedor: any) => {
                paquete.proveedor = proveedor;
              },
              (error) => {
                console.error(`Error al obtener proveedor con ID ${idProveedor}:`, error);
              }
            );
          }

          if (idDestino) {
            this.paqueteService.getDestinoPorId(idDestino).subscribe(
              (destino: any) => {
                paquete.destino = destino;
              },
              (error) => {
                console.error(`Error al obtener destino con ID ${idDestino}:`, error);
              }
            );
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar paquetes:', error);
        this.errorMessage = 'Error al cargar la lista de paquetes.';
      }
    });
  }

  buscarProveedorPorId(id: number): void {
    if (!id) return;

    this.paqueteService.getProveedorPorId(id).subscribe({
      next: (proveedor: any) => {
        this.proveedorNombre = proveedor.nombreCompleto || 'Nombre no disponible';
      },
      error: (error) => {
        console.error('Error al buscar proveedor:', error);
        this.proveedorNombre = 'Proveedor no encontrado';
      }
    });
  }

  buscarDestinoPorId(id: number): void {
    if (!id) return;

    this.paqueteService.getDestinoPorId(id).subscribe({
      next: (destino: any) => {
        this.destinoNombre = destino.nombre || 'Nombre no disponible';
      },
      error: (error) => {
        console.error('Error al buscar destino:', error);
        this.destinoNombre = 'Destino no encontrado';
      }
    });
  }

  // Métodos para buscar manualmente los proveedores y destinos
  buscarProveedor(): void {
    const id = this.paqueteForm.get('proveedorId')?.value;
    if (!id) return;
    this.buscarProveedorPorId(id);
  }

  buscarDestino(): void {
    const id = this.paqueteForm.get('destinoId')?.value;
    if (!id) return;
    this.buscarDestinoPorId(id);
  }

  guardar(): void {
    this.errorMessage = '';
    const formValue = this.paqueteForm.value;

    // Validación para asegurarse de que se haya ingresado IDs válidos
    if (!formValue.proveedorId || isNaN(formValue.proveedorId)) {
      this.errorMessage = 'Por favor, ingresa un ID de proveedor válido.';
      return;
    }

    if (!formValue.destinoId || isNaN(formValue.destinoId)) {
      this.errorMessage = 'Por favor, ingresa un ID de destino válido.';
      return;
    }

    // CORRECCIÓN: Enviar IDs como valores primitivos con los nombres de campo correctos
    const paquete = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      imagenUrl: formValue.imagenUrl,
      precioTotal: formValue.precioTotal,
      estado: formValue.estado,
      duracionDias: formValue.duracionDias,
      localidad: formValue.localidad,
      tipoActividad: formValue.tipoActividad,
      cuposMaximos: formValue.cuposMaximos,
      fechaInicio: this.formatFecha(formValue.fechaInicio),
      fechaFin: this.formatFecha(formValue.fechaFin),
      proveedor: formValue.proveedorId ? parseInt(formValue.proveedorId, 10) : null,
      destino: formValue.destinoId ? parseInt(formValue.destinoId, 10) : null
    };

    console.log('Enviando paquete:', paquete);

    if (this.editando && this.idPaqueteEditando !== null) {
      this.paqueteService.update(this.idPaqueteEditando, paquete).subscribe({
        next: () => {
          this.resetForm();
          this.cargarPaquetes();
        },
        error: (error) => {
          console.error('Error al actualizar paquete:', error);
          this.errorMessage = 'Error al actualizar el paquete. Verifique los datos e intente nuevamente.';
          if (error.error && error.error.message) {
            this.errorMessage += ` Detalle: ${error.error.message}`;
          }
        }
      });
    } else {
      this.paqueteService.create(paquete).subscribe({
        next: () => {
          this.resetForm();
          this.cargarPaquetes();
        },
        error: (error) => {
          console.error('Error al crear paquete:', error);
          this.errorMessage = 'Error al crear el paquete. Verifique los datos e intente nuevamente.';
          if (error.error && error.error.message) {
            this.errorMessage += ` Detalle: ${error.error.message}`;
          }
        }
      });
    }
  }

  editar(paquete: any): void {
    this.editando = true;
    this.idPaqueteEditando = paquete.idPaquete;

    // Convertir las fechas a formato compatible con datetime-local
    let fechaInicio = new Date(paquete.fechaInicio);
    let fechaFin = new Date(paquete.fechaFin);

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
      fechaInicio: this.formatDatetimeLocal(fechaInicio),
      fechaFin: this.formatDatetimeLocal(fechaFin),
      proveedorId: paquete.proveedor ?? paquete.proveedorId ?? paquete.proveedor?.idProveedor ?? '',
      destinoId: paquete.destino ?? paquete.destinoId ?? paquete.destino?.idDestino ?? ''
    });

    // Cargar nombres de proveedor y destino si están disponibles
    this.proveedorNombre = paquete.proveedor?.nombreCompleto ?? '';
    this.destinoNombre = paquete.destino?.nombre ?? '';
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este paquete?')) {
      this.paqueteService.delete(id).subscribe({
        next: () => {
          this.cargarPaquetes();
        },
        error: (error) => {
          console.error('Error al eliminar paquete:', error);
          this.errorMessage = 'Error al eliminar el paquete.';
        }
      });
    }
  }

  resetForm(): void {
    this.paqueteForm.reset();
    this.paqueteForm.markAsPristine();
    this.paqueteForm.markAsUntouched();
    this.editando = false;
    this.idPaqueteEditando = null;
    this.errorMessage = '';
    this.proveedorNombre = '';
    this.destinoNombre = '';
  }

  // Nuevo método para formatear fecha para inputs datetime-local
  private formatDatetimeLocal(date: Date): string {
    if (isNaN(date.getTime())) return '';

    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  private formatFecha(fecha: any): string {
    if (!fecha) return '';

    try {
      const f = new Date(fecha);

      // Verificar si la fecha es válida
      if (isNaN(f.getTime())) {
        console.error('Fecha inválida:', fecha);
        return '';
      }

      const year = f.getFullYear();
      const month = (f.getMonth() + 1).toString().padStart(2, '0');
      const day = f.getDate().toString().padStart(2, '0');
      const hours = f.getHours().toString().padStart(2, '0');
      const minutes = f.getMinutes().toString().padStart(2, '0');
      const seconds = f.getSeconds().toString().padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  }
}
