import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DestinosService } from './destinos.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GoogleMapsModule } from '@angular/google-maps'; // Importa el módulo GoogleMapsModule

@Component({
  selector: 'app-destinos',
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
    GoogleMapsModule // Añade el módulo a los imports
  ],
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.scss']
})
export class DestinosComponent implements OnInit {
  destinos: any[] = [];
  destinoForm!: FormGroup;
  editando = false;
  idDestinoEditando: number | null = null;
  minDate: Date;
  usuarioNombre: string = '';
  errorMessage: string = '';
  formularioVisible: boolean = false;

  // Define las propiedades necesarias para Google Maps
  mapCenter: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 };
  selectedLat: number | null = null;
  selectedLng: number | null = null;

  constructor(private destinoService: DestinosService, private fb: FormBuilder) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
      const usuario = JSON.parse(usuarioLogueado);
      this.destinoForm = this.fb.group({
        nombre: ['', Validators.required],
        descripcion: ['', Validators.required],
        ubicacion: ['', Validators.required],
        imagenUrl: ['', Validators.required],
        latitud: ['', [Validators.required, Validators.pattern('^-?\\d*\\.\\d+$')]],
        longitud: ['', [Validators.required, Validators.pattern('^-?\\d*\\.\\d+$')]],
        popularidad: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
        preciomedio: ['', [Validators.required, Validators.min(0)]],
        rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]]
      });

      this.usuarioNombre = usuario.email;
    } else {
      this.destinoForm = this.fb.group({
        nombre: ['', Validators.required],
        descripcion: ['', Validators.required],
        ubicacion: ['', Validators.required],
        imagenUrl: ['', Validators.required],
        latitud: ['', [Validators.required, Validators.pattern('^-?\\d*\\.\\d+$')]],
        longitud: ['', [Validators.required, Validators.pattern('^-?\\d*\\.\\d+$')]],
        popularidad: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
        preciomedio: ['', [Validators.required, Validators.min(0)]],
        rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]]
      });
    }

    this.cargarDestinos();
  }

  // Método para alternar la visibilidad del formulario
  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) {
      this.resetForm();
    }
  }

  cargarDestinos(): void {
    this.destinoService.getAll().subscribe({
      next: (data: any[]) => {
        this.destinos = data;
        // Lógica adicional si es necesario
      },
      error: (error) => {
        console.error('Error al cargar destinos:', error);
        this.errorMessage = 'Error al cargar la lista de destinos.';
      }
    });
  }

  guardar(): void {
    this.errorMessage = '';
    const formValue = this.destinoForm.value;

    if (!formValue.nombre || !formValue.descripcion || !formValue.ubicacion) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;

    if (!usuario || !usuario.idUsuario) {
      this.errorMessage = 'No se ha encontrado un usuario logueado.';
      return;
    }

    const destino = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      ubicacion: formValue.ubicacion,
      imagenUrl: formValue.imagenUrl,
      latitud: formValue.latitud,
      longitud: formValue.longitud,
      popularidad: formValue.popularidad,
      preciomedio: formValue.preciomedio,
      rating: formValue.rating,
      usuario: usuario.idUsuario // Asignando el id del usuario logueado
    };

    console.log('Enviando destino:', destino);

    if (this.editando && this.idDestinoEditando !== null) {
      this.destinoService.update(this.idDestinoEditando, destino).subscribe({
        next: () => {
          this.resetForm();
          this.cargarDestinos();
        },
        error: (error) => {
          console.error('Error al actualizar destino:', error);
          this.errorMessage = 'Error al actualizar el destino. Verifique los datos e intente nuevamente.';
        }
      });
    } else {
      this.destinoService.create(destino).subscribe({
        next: () => {
          this.resetForm();
          this.cargarDestinos();
        },
        error: (error) => {
          console.error('Error al crear destino:', error);
          this.errorMessage = 'Error al crear el destino. Verifique los datos e intente nuevamente.';
        }
      });
    }
  }

  editar(destino: any): void {
    this.editando = true;
    this.idDestinoEditando = destino.idDestino;
    this.formularioVisible = true;

    // Asegúrate de pasar los valores correctos a patchValue
    if (destino.nombre && destino.descripcion && destino.ubicacion) {
      this.destinoForm.patchValue({
        nombre: destino.nombre,
        descripcion: destino.descripcion,
        ubicacion: destino.ubicacion,
        imagenUrl: destino.imagenUrl,
        latitud: destino.latitud,
        longitud: destino.longitud,
        popularidad: destino.popularidad,
        preciomedio: destino.preciomedio,
        rating: destino.rating
      });

      // Actualizar las coordenadas del mapa y el marcador
      this.selectedLat = destino.latitud;
      this.selectedLng = destino.longitud;
      if (this.selectedLat && this.selectedLng) {
        this.mapCenter = { lat: this.selectedLat, lng: this.selectedLng };
      }
    } else {
      console.error('Destino con datos incompletos:', destino);
    }

    // Verificar si destino.usuario es válido antes de asignar el nombre
    this.usuarioNombre = destino.usuario ? destino.usuario.nombre : '';
  }

  eliminar(id: number): void {
    const confirmacion = confirm('¿Estás seguro de eliminar este destino?');

    if (confirmacion) {
      // Si el usuario acepta, se procede a eliminar el destino
      this.destinoService.delete(id).subscribe({
        next: () => {
          this.cargarDestinos();  // Recargar la lista de destinos
        },
        error: (error) => {
          console.error('Error al eliminar destino:', error);
        }
      });
    } else {
      // Si el usuario cancela, no se hace nada
      console.log('Eliminación cancelada');
    }
  }

  resetForm(): void {
    this.destinoForm.reset();
    this.destinoForm.markAsPristine();
    this.destinoForm.markAsUntouched();
    this.editando = false;
    this.idDestinoEditando = null;
    this.usuarioNombre = '';
    this.errorMessage = '';
    this.formularioVisible = false;
    this.selectedLat = null;
    this.selectedLng = null;
  }

  // Corregido: Correcto tipado para el evento del mapa
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.selectedLat = event.latLng.lat();
      this.selectedLng = event.latLng.lng();
      this.destinoForm.patchValue({
        latitud: this.selectedLat,
        longitud: this.selectedLng
      });
    }
  }
}
