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

  // Define las propiedades necesarias para Mapbox
  map: mapboxgl.Map | null = null;
  marker: mapboxgl.Marker | null = null;
  mapCenter: [number, number] = [-77.0428, -12.0464]; // [lng, lat] - Mapbox usa este orden
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  mapboxToken = 'pk.eyJ1IjoiamVhbnJxODgiLCJhIjoiY21hYmExM2liMjljeDJscHdhc25oYWo0bCJ9.Gd8w_nlLHD2YY9UvfoPI9A'; // Reemplaza con tu token de Mapbox

  constructor(private destinoService: DestinosService, private fb: FormBuilder) {
    this.minDate = new Date();
    // Configura el token de acceso de Mapbox
    (mapboxgl as any).accessToken = this.mapboxToken;
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

  ngAfterViewInit(): void {
    // Inicializar el mapa después de que la vista esté completamente cargada
    this.initMap();
  }

  initMap(): void {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.map = new mapboxgl.Map({
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: this.mapCenter,
        zoom: 12
      });

      // Añadir controles de navegación
      this.map.addControl(new mapboxgl.NavigationControl());

      // Escuchar eventos de clic en el mapa
      this.map.on('click', (e) => {
        this.onMapClick(e);
      });
    }
  }

  // Método para alternar la visibilidad del formulario
  toggleForm(): void {
    this.formularioVisible = !this.formularioVisible;
    if (!this.formularioVisible) {
      this.resetForm();
    } else {
      // Si el mapa aún no existe, inicializarlo
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

      // Actualizar el mapa después de que sea visible
      setTimeout(() => {
        if (this.selectedLat && this.selectedLng) {
          this.actualizarMarcador(this.selectedLng, this.selectedLat);
        }
      }, 200);
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

    // Eliminar el marcador si existe
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  // Método para obtener la dirección a partir de coordenadas (geocodificación inversa con Mapbox)
  obtenerDireccion(lng: number, lat: number): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}&language=es`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          const direccion = data.features[0].place_name;
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


  // Actualizar o crear un marcador en el mapa
  actualizarMarcador(lng: number, lat: number): void {
    if (!this.map) {
      setTimeout(() => this.actualizarMarcador(lng, lat), 100);
      return;
    }

    // Actualizar el centro del mapa
    this.map.setCenter([lng, lat]);

    // Eliminar el marcador anterior si existe
    if (this.marker) {
      this.marker.remove();
    }

    // Crear un nuevo marcador
    this.marker = new mapboxgl.Marker({
      color: '#FF0000',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(this.map);

    // Escuchar el evento dragend para actualizar los valores cuando se arrastra el marcador
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

  // Evento de clic en el mapa
  onMapClick(event: mapboxgl.MapMouseEvent): void {
    if (event.lngLat) {
      this.selectedLng = event.lngLat.lng;
      this.selectedLat = event.lngLat.lat;

      // Actualizar los campos de latitud y longitud en el formulario
      this.destinoForm.patchValue({
        latitud: this.selectedLat,
        longitud: this.selectedLng
      });

      // Añadir o actualizar el marcador
      this.actualizarMarcador(this.selectedLng, this.selectedLat);

      // Obtener y actualizar automáticamente la dirección correspondiente
      this.obtenerDireccion(this.selectedLng, this.selectedLat);
    }
  }
}
