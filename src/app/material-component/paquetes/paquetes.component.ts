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

  // Variables para mostrar información de proveedor y destino
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
  }

  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) {
      this.resetForm();
    }
  }

  cargarPaquetes(): void {
    this.paqueteService.getAll().subscribe({
      next: (data: any[]) => {
        this.paquetes = data;

        // Cargar información adicional de proveedores y destinos
        this.paquetes.forEach(paquete => {
          // Asegurarse de tener IDs válidos antes de hacer las consultas
          if (paquete.proveedor && typeof paquete.proveedor === 'number') {
            this.paqueteService.getProveedorPorId(paquete.proveedor).subscribe(
              (proveedor: any) => {
                paquete.proveedor = proveedor;
              },
              (error) => {
                console.error(`Error al obtener proveedor con ID ${paquete.proveedor}:`, error);
              }
            );
          } else if (paquete.proveedor?.idProveedor) {
            this.paqueteService.getProveedorPorId(paquete.proveedor.idProveedor).subscribe(
              (proveedor: any) => {
                paquete.proveedor = proveedor;
              },
              (error) => {
                console.error(`Error al obtener proveedor con ID ${paquete.proveedor.idProveedor}:`, error);
              }
            );
          }

          if (paquete.destino && typeof paquete.destino === 'number') {
            this.paqueteService.getDestinoPorId(paquete.destino).subscribe(
              (destino: any) => {
                paquete.destino = destino;
              },
              (error) => {
                console.error(`Error al obtener destino con ID ${paquete.destino}:`, error);
              }
            );
          } else if (paquete.destino?.idDestino) {
            this.paqueteService.getDestinoPorId(paquete.destino.idDestino).subscribe(
              (destino: any) => {
                paquete.destino = destino;
              },
              (error) => {
                console.error(`Error al obtener destino con ID ${paquete.destino.idDestino}:`, error);
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
    if (this.paqueteForm.invalid) {
      this.paqueteForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

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

    console.log('Enviando paquete:', paquete);

    if (this.editando && this.idPaqueteEditando !== null) {
      this.paqueteService.update(this.idPaqueteEditando, paquete).subscribe({
        next: () => {
          this.resetForm();
          this.cargarPaquetes();
          this.formularioVisible = false;
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
          this.formularioVisible = false;
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
    this.formularioVisible = true;

    // Extraer IDs correctamente
    let proveedorId = null;
    if (typeof paquete.proveedor === 'number') {
      proveedorId = paquete.proveedor;
    } else if (paquete.proveedor?.idProveedor) {
      proveedorId = paquete.proveedor.idProveedor;
    }

    let destinoId = null;
    if (typeof paquete.destino === 'number') {
      destinoId = paquete.destino;
    } else if (paquete.destino?.idDestino) {
      destinoId = paquete.destino.idDestino;
    }

    // Convertir las fechas a formato YYYY-MM-DD para el input type date
    let fechaInicio = '';
    let fechaFin = '';

    if (paquete.fechaInicio) {
      const dateInicio = new Date(paquete.fechaInicio);
      if (!isNaN(dateInicio.getTime())) {
        fechaInicio = dateInicio.toISOString().split('T')[0];
      }
    }

    if (paquete.fechaFin) {
      const dateFin = new Date(paquete.fechaFin);
      if (!isNaN(dateFin.getTime())) {
        fechaFin = dateFin.toISOString().split('T')[0];
      }
    }

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
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      proveedorId: proveedorId,
      destinoId: destinoId
    });

    // Cargar nombres de proveedor y destino
    if (paquete.proveedor?.nombreCompleto) {
      this.proveedorNombre = paquete.proveedor.nombreCompleto;
    } else if (proveedorId) {
      this.buscarProveedorPorId(proveedorId);
    }

    if (paquete.destino?.nombre) {
      this.destinoNombre = paquete.destino.nombre;
    } else if (destinoId) {
      this.buscarDestinoPorId(destinoId);
    }
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
    this.paqueteForm.reset({
      estado: 'DISPONIBLE'  // Establecer un valor predeterminado para el estado
    });
    this.paqueteForm.markAsPristine();
    this.paqueteForm.markAsUntouched();
    this.editando = false;
    this.idPaqueteEditando = null;
    this.errorMessage = '';
    this.proveedorNombre = '';
    this.destinoNombre = '';
  }

  private formatFecha(fecha: any): string {
    if (!fecha) return '';

    try {
      // Si la fecha ya está en formato YYYY-MM-DD, agregarle la hora
      let fechaObj;
      if (typeof fecha === 'string' && fecha.includes('-') && !fecha.includes(':')) {
        fechaObj = new Date(fecha + 'T00:00:00');
      } else {
        fechaObj = new Date(fecha);
      }

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida:', fecha);
        return '';
      }

      const year = fechaObj.getFullYear();
      const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const day = fechaObj.getDate().toString().padStart(2, '0');

      // En formato YYYY-MM-DD HH:MM:SS para el backend
      return `${year}-${month}-${day} 00:00:00`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  }
}
