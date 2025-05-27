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
  subiendoImagen = false;

  proveedorNombre: string = '';
  destinoNombre: string = '';
  selectedFile: File | null = null;

  constructor(private paqueteService: PaquetesService, private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPaquetes();
  }

  getPaquetesPorMes(): Observable<any[]> {
    return this.paqueteService.getAll();
  }

  inicializarFormulario(): void {
    this.paqueteForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
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

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Solo se permiten archivos de imagen (JPG, PNG, GIF).';
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.errorMessage = 'El archivo es demasiado grande. Máximo 5MB.';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
      console.log('Archivo seleccionado:', file.name, 'Tipo:', file.type, 'Tamaño:', file.size);
    }
  }

  guardar(): void {
    this.errorMessage = '';

    if (this.paqueteForm.invalid) {
      this.paqueteForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    // Validar que se haya seleccionado una imagen para nuevos paquetes
    if (!this.selectedFile && !this.editando) {
      this.errorMessage = 'Por favor, selecciona una imagen.';
      return;
    }

    const formValue = this.paqueteForm.value;

    // Crear el objeto DTO como JSON
    const paqueteDto = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
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

    // Crear FormData con el DTO como JSON y el archivo
    const formData = new FormData();

    // Crear un blob para el JSON con el tipo correcto
    const dtoBlob = new Blob([JSON.stringify(paqueteDto)], {
      type: 'application/json'
    });
    formData.append('dto', dtoBlob);

    // Agregar la imagen si fue seleccionada
    if (this.selectedFile) {
      formData.append('imagenFile', this.selectedFile, this.selectedFile.name);
    }

    if (this.editando && this.idPaqueteEditando !== null) {
      this.paqueteService.update(this.idPaqueteEditando, formData).subscribe({
        next: (response) => {
          console.log('Paquete actualizado exitosamente:', response);
          this.resetForm();
          this.cargarPaquetes();
        },
        error: (error) => {
          console.error('Error al actualizar paquete:', error);
          this.errorMessage = 'Error al actualizar el paquete: ' + (error.error?.detail || error.error?.message || error.message);
        }
      });
    } else {
      this.paqueteService.create(formData).subscribe({
        next: (response) => {
          console.log('Paquete creado exitosamente:', response);
          this.resetForm();
          this.cargarPaquetes();
        },
        error: (error) => {
          console.error('Error al crear paquete:', error);
          this.errorMessage = 'Error al crear el paquete: ' + (error.error?.detail || error.error?.message || error.message);
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

    // Limpiar archivo seleccionado al editar
    this.selectedFile = null;

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
    this.paqueteForm.markAsPristine();
    this.paqueteForm.markAsUntouched();
    this.editando = false;
    this.idPaqueteEditando = null;
    this.errorMessage = '';
    this.formularioVisible = false;
    this.proveedorNombre = '';
    this.destinoNombre = '';
    this.selectedFile = null;
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
