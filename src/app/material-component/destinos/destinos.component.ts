import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import * as mapboxgl from 'mapbox-gl';

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
    MatNativeDateModule
  ],
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.scss']
})
export class DestinosComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  destinos: any[] = [];
  destinoForm!: FormGroup;
  editando = false;
  idDestinoEditando: number | null = null;
  minDate: Date;
  usuarioNombre: string = '';
  errorMessage: string = '';
  formularioVisible: boolean = false;
  subiendoImagen = false;

  map: mapboxgl.Map | null = null;
  marker: mapboxgl.Marker | null = null;
  mapCenter: [number, number] = [-77.0428, -12.0464];
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  mapboxToken = 'pk.eyJ1IjoiamVhbnJxODgiLCJhIjoiY21hYmExM2liMjljeDJscHdhc25oYWo0bCJ9.Gd8w_nlLHD2YY9UvfoPI9A';

  selectedFile: File | null = null;

  constructor(private destinoService: DestinosService, private fb: FormBuilder) {
    this.minDate = new Date();
    (mapboxgl as any).accessToken = this.mapboxToken;
  }

  ngOnInit(): void {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const controls = {
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      latitud: ['', [Validators.required, Validators.pattern('^-?\\d*\\.?\\d+$')]],
      longitud: ['', [Validators.required, Validators.pattern('^-?\\d*\\.?\\d+$')]],
      popularidad: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      preciomedio: ['', [Validators.required, Validators.min(0)]],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]]
    };

    this.destinoForm = this.fb.group(controls);

    if (usuarioLogueado) {
      const usuario = JSON.parse(usuarioLogueado);
      this.usuarioNombre = usuario.email;
    }

    this.cargarDestinos();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    if (this.mapContainer?.nativeElement) {
      this.map = new mapboxgl.Map({
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: this.mapCenter,
        zoom: 12
      });

      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('click', (e) => this.onMapClick(e));
    }
  }

  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) {
      this.resetForm();
    } else {
      setTimeout(() => {
        if (!this.map && this.mapContainer) {
          this.initMap();
        }
      }, 100);
    }
  }

  cargarDestinos(): void {
    this.destinoService.getAll().subscribe({
      next: (data: any[]) => {
        this.destinos = data;
      },
      error: (error) => {
        console.error('Error al cargar destinos:', error);
        this.errorMessage = 'Error al cargar la lista de destinos.';
      }
    });
  }

  guardar(): void {
    this.errorMessage = '';

    if (this.destinoForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;

    if (!usuario?.idUsuario) {
      this.errorMessage = 'No se ha encontrado un usuario logueado.';
      return;
    }

    if (!this.selectedFile && !this.editando) {
      this.errorMessage = 'Por favor, selecciona una imagen.';
      return;
    }

    const formValue = this.destinoForm.value;

    // Crear el objeto DTO como JSON
    const destinoDto = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      ubicacion: formValue.ubicacion,
      latitud: parseFloat(formValue.latitud),
      longitud: parseFloat(formValue.longitud),
      popularidad: parseInt(formValue.popularidad),
      preciomedio: parseFloat(formValue.preciomedio),
      rating: parseFloat(formValue.rating),
      usuarioId: usuario.idUsuario // Asegúrate de incluir el ID del usuario
    };

    // Crear FormData con el DTO como JSON y el archivo
    const formData = new FormData();

    // Crear un blob para el JSON con el tipo correcto
    const dtoBlob = new Blob([JSON.stringify(destinoDto)], {
      type: 'application/json'
    });
    formData.append('dto', dtoBlob);

    if (this.selectedFile) {
      formData.append('imagenFile', this.selectedFile, this.selectedFile.name);
    }

    if (this.editando && this.idDestinoEditando !== null) {
      this.destinoService.update(this.idDestinoEditando, formData).subscribe({
        next: (response) => {
          console.log('Destino actualizado exitosamente:', response);
          this.resetForm();
          this.cargarDestinos();
        },
        error: (error) => {
          console.error('Error al actualizar destino:', error);
          this.errorMessage = 'Error al actualizar el destino: ' + (error.error?.detail || error.error?.message || error.message);
        }
      });
    } else {
      this.destinoService.create(formData).subscribe({
        next: (response) => {
          console.log('Destino creado exitosamente:', response);
          this.resetForm();
          this.cargarDestinos();
        },
        error: (error) => {
          console.error('Error al crear destino:', error);
          this.errorMessage = 'Error al crear el destino: ' + (error.error?.detail || error.error?.message || error.message);
        }
      });
    }
  }
  editar(destino: any): void {
    this.editando = true;
    this.idDestinoEditando = destino.idDestino;
    this.formularioVisible = true;

    this.destinoForm.patchValue({
      nombre: destino.nombre,
      descripcion: destino.descripcion,
      ubicacion: destino.ubicacion,
      latitud: destino.latitud,
      longitud: destino.longitud,
      popularidad: destino.popularidad,
      preciomedio: destino.preciomedio,
      rating: destino.rating
    });

    this.selectedLat = destino.latitud;
    this.selectedLng = destino.longitud;
    this.selectedFile = null;

    setTimeout(() => {
      if (this.selectedLat && this.selectedLng) {
        this.actualizarMarcador(this.selectedLng, this.selectedLat);
      }
    }, 200);

    this.usuarioNombre = destino.usuario?.nombre || '';
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este destino?')) {
      this.destinoService.delete(id).subscribe({
        next: () => this.cargarDestinos(),
        error: (error) => console.error('Error al eliminar destino:', error)
      });
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
    this.selectedFile = null;

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  obtenerDireccion(lng: number, lat: number): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}&language=es`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const direccion = data?.features?.[0]?.place_name;
        if (direccion) {
          this.destinoForm.patchValue({ ubicacion: direccion });
        } else {
          this.errorMessage = 'No se encontró una dirección para estas coordenadas.';
        }
      })
      .catch(error => {
        console.error('Error al obtener la dirección:', error);
        this.errorMessage = 'Error al obtener la dirección desde Mapbox.';
      });
  }

  actualizarMarcador(lng: number, lat: number): void {
    if (!this.map) {
      setTimeout(() => this.actualizarMarcador(lng, lat), 100);
      return;
    }

    this.map.setCenter([lng, lat]);

    if (this.marker) {
      this.marker.remove();
    }

    this.marker = new mapboxgl.Marker({ color: '#FF0000', draggable: true })
      .setLngLat([lng, lat])
      .addTo(this.map);

    this.marker.on('dragend', () => {
      const lngLat = this.marker?.getLngLat();
      if (lngLat) {
        this.selectedLng = lngLat.lng;
        this.selectedLat = lngLat.lat;
        this.destinoForm.patchValue({
          latitud: this.selectedLat,
          longitud: this.selectedLng
        });
        this.obtenerDireccion(this.selectedLng, this.selectedLat);
      }
    });
  }

  onMapClick(event: mapboxgl.MapMouseEvent): void {
    if (event.lngLat) {
      this.selectedLng = event.lngLat.lng;
      this.selectedLat = event.lngLat.lat;

      this.destinoForm.patchValue({
        latitud: this.selectedLat,
        longitud: this.selectedLng
      });

      this.actualizarMarcador(this.selectedLng, this.selectedLat);
      this.obtenerDireccion(this.selectedLng, this.selectedLat);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Solo se permiten archivos de imagen (JPG, PNG, GIF).';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.errorMessage = 'El archivo es demasiado grande. Máximo 5MB.';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
      console.log('Archivo seleccionado:', file.name, 'Tipo:', file.type, 'Tamaño:', file.size);
    }
  }
}
