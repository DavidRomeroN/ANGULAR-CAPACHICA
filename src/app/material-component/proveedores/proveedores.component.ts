// proveedores.component.ts (versión corregida)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedoresService } from './proveedores.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-proveedores',
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
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {
  proveedores: any[] = [];
  proveedorForm!: FormGroup;
  editando = false;
  idProveedorEditando: number | null = null;
  minDate: Date;
  usuarioNombre: string = '';  // Para mostrar el nombre del usuario
  errorMessage: string = '';

  constructor(private proveedorService: ProveedoresService, private fb: FormBuilder) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      usuarioId: [null, Validators.required], // Aquí se define el campo "usuarioId"
      fechaRegistro: ['', Validators.required]
    });

    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.proveedorService.getAll().subscribe({
      next: (data: any[]) => {
        this.proveedores = data;

        this.proveedores.forEach((proveedor) => {
          const idUsuario = proveedor.usuario?.idUsuario;

          if (idUsuario) {
            this.proveedorService.getUsuarioPorId(idUsuario).subscribe(
              (usuario: any) => {
                proveedor.usuario = usuario;
              },
              (error) => {
                console.error(`Error al obtener usuario con ID ${idUsuario}:`, error);
              }
            );
          } else {
            console.warn('Proveedor sin usuario asociado o ID de usuario no definido:', proveedor);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.errorMessage = 'Error al cargar la lista de proveedores.';
      }
    });
  }

  buscarUsuarioPorId(): void {
    const id = this.proveedorForm.get('usuarioId')?.value;
    if (!id) return;

    this.proveedorService.getUsuarioPorId(id).subscribe({
      next: (usuario: any) => {
        this.usuarioNombre = usuario.nombre; // Asume que el campo es "nombre"
      },
      error: () => {
        this.usuarioNombre = 'Usuario no encontrado';
      }
    });
  }

  guardar(): void {
    this.errorMessage = '';
    const formValue = this.proveedorForm.value;

    // Validación para asegurarse de que se haya ingresado un ID de usuario válido
    if (!formValue.usuarioId || isNaN(formValue.usuarioId)) {
      this.errorMessage = 'Por favor, ingresa un ID de usuario válido.';
      return;
    }

    // Asegurarnos de que fechaRegistro sea un objeto Date y convertirla a formato adecuado
    let fechaFormateada;
    try {
      const fecha = new Date(formValue.fechaRegistro);
      if (isNaN(fecha.getTime())) {
        this.errorMessage = 'Fecha inválida.';
        return;
      }

      // Formato YYYY-MM-DD HH:MM:SS como string
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      const hours = fecha.getHours().toString().padStart(2, '0');
      const minutes = fecha.getMinutes().toString().padStart(2, '0');
      const seconds = fecha.getSeconds().toString().padStart(2, '0');

      fechaFormateada = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      this.errorMessage = 'Error al procesar la fecha.';
      return;
    }

    // El backend espera solo el ID numérico del usuario, no un objeto completo
    const userId = parseInt(formValue.usuarioId, 10);

    const proveedor = {
      nombreCompleto: formValue.nombreCompleto,
      email: formValue.email,
      telefono: formValue.telefono,
      fechaRegistro: fechaFormateada,
      usuario: userId // Solo el ID del usuario como número
    };

    console.log('Enviando proveedor:', proveedor);

    if (this.editando && this.idProveedorEditando !== null) {
      this.proveedorService.update(this.idProveedorEditando, proveedor).subscribe({
        next: () => {
          this.resetForm();
          this.cargarProveedores();
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
          this.errorMessage = 'Error al actualizar el proveedor. Verifique los datos e intente nuevamente.';
          if (error.error && error.error.message) {
            this.errorMessage += ` Detalle: ${error.error.message}`;
          }
        }
      });
    } else {
      this.proveedorService.create(proveedor).subscribe({
        next: () => {
          this.resetForm();
          this.cargarProveedores();
        },
        error: (error) => {
          console.error('Error al crear proveedor:', error);
          this.errorMessage = 'Error al crear el proveedor. Verifique los datos e intente nuevamente.';
          if (error.error && error.error.message) {
            this.errorMessage += ` Detalle: ${error.error.message}`;
          }
        }
      });
    }
  }

  editar(proveedor: any): void {
    this.editando = true;
    this.idProveedorEditando = proveedor.idProveedor;
    this.proveedorForm.patchValue({
      nombreCompleto: proveedor.nombreCompleto,
      email: proveedor.email,
      telefono: proveedor.telefono,
      usuarioId: proveedor.usuario?.idUsuario ?? '', // Se utiliza el ID del usuario
      fechaRegistro: new Date(proveedor.fechaRegistro) // Convertir la fecha a un objeto Date
    });

    this.usuarioNombre = proveedor.usuario?.nombre ?? ''; // Nombre del usuario relacionado
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.proveedorService.delete(id).subscribe({
        next: () => {
          this.cargarProveedores();
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
          this.errorMessage = 'Error al eliminar el proveedor.';
        }
      });
    }
  }

  resetForm(): void {
    this.proveedorForm.reset();
    this.proveedorForm.markAsPristine();
    this.proveedorForm.markAsUntouched();
    this.editando = false;
    this.idProveedorEditando = null;
    this.usuarioNombre = '';
    this.errorMessage = '';
  }
}

