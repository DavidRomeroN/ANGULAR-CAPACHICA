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
  usuarioNombre: string = '';
  errorMessage: string = '';
  formularioVisible: boolean = false;

  constructor(private proveedorService: ProveedoresService, private fb: FormBuilder) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
      const usuario = JSON.parse(usuarioLogueado);
      this.proveedorForm = this.fb.group({
        nombreCompleto: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        fechaRegistro: ['', Validators.required]
      });

      this.usuarioNombre = usuario.email;
    } else {
      this.proveedorForm = this.fb.group({
        nombreCompleto: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        fechaRegistro: ['', Validators.required]
      });
    }

    this.cargarProveedores();
  }

  // Método para alternar la visibilidad del formulario
  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) {
      this.resetForm();
    }
  }

  cargarProveedores(): void {
    this.proveedorService.getAll().subscribe({
      next: (data: any[]) => {
        this.proveedores = data;
        // Lógica adicional si es necesario
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.errorMessage = 'Error al cargar la lista de proveedores.';
      }
    });
  }

  guardar(): void {
    this.errorMessage = '';
    const formValue = this.proveedorForm.value;

    if (!formValue.nombreCompleto || !formValue.email || !formValue.telefono) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;

    if (!usuario || !usuario.idUsuario) {
      this.errorMessage = 'No se ha encontrado un usuario logueado.';
      return;
    }

    // Generación de fecha y hora actuales en zona horaria de Perú (UTC-5)
    let fechaFormateada;
    try {
      const fechaPeru = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
      const fecha = new Date(fechaPeru);
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

    const proveedor = {
      nombreCompleto: formValue.nombreCompleto,
      email: formValue.email,
      telefono: formValue.telefono,
      fechaRegistro: fechaFormateada,  // Asignamos la fecha y hora actuales
      usuario: usuario.idUsuario // Asignando el id del usuario logueado
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
        }
      });
    }
  }


  editar(proveedor: any): void {
    this.editando = true;
    this.idProveedorEditando = proveedor.idProveedor;
    this.formularioVisible = true;

    // Si la fechaRegistro es válida, formatearla para que sea compatible con el input de tipo "datetime-local"
    if (proveedor.fechaRegistro) {
      const fecha = new Date(proveedor.fechaRegistro);
      const offset = fecha.getTimezoneOffset();
      const localDate = new Date(fecha.getTime() - offset * 60000);
      const fechaFormateada = localDate.toISOString().slice(0, 16); // Formato compatible con input datetime-local

      // Asegúrate de pasar los valores correctos a patchValue
      this.proveedorForm.patchValue({
        fechaRegistro: fechaFormateada
      });
    }

    // Verificar si los valores existen antes de llamar a patchValue
    if (proveedor.nombreCompleto && proveedor.email && proveedor.telefono) {
      this.proveedorForm.patchValue({
        nombreCompleto: proveedor.nombreCompleto,
        email: proveedor.email,
        telefono: proveedor.telefono
      });
    } else {
      console.error('Proveedor con datos incompletos:', proveedor);
    }

    // Verificar si proveedor.usuario es válido antes de asignar el nombre
    this.usuarioNombre = proveedor.usuario ? proveedor.usuario.nombre : '';
  }

  eliminar(id: number): void {
    const confirmacion = confirm('¿Estás seguro de eliminar este proveedor?');

    if (confirmacion) {
      // Si el usuario acepta, se procede a eliminar el proveedor
      this.proveedorService.delete(id).subscribe({
        next: () => {
          this.cargarProveedores();  // Recargar la lista de proveedores
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
        }
      });
    } else {
      // Si el usuario cancela, no se hace nada
      console.log('Eliminación cancelada');
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
    this.formularioVisible = false;
  }
}
