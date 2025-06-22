import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from "@angular/common";
import { DestinosService } from "../../../../material-component/destinos/destinos.service";
import { AuthService } from 'src/app/services/auth.service';

// Importar Leaflet
import * as L from 'leaflet';

@Component({
  selector: 'app-inf-destino',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inf-destino.component.html',
  styleUrls: ['./inf-destino.component.scss']
})
export class InfDestinoComponent implements OnInit, AfterViewInit, OnDestroy {
  destino: any;
  isAuthenticated = false;
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  mapInitialized = false;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinoService: DestinosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    this.isAuthenticated = this.authService.isLoggedIn();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDestino(+id);
    }
  }

  ngAfterViewInit(): void {
    // Verificar que el ViewChild esté disponible antes de inicializar
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.initializeMap();
    } else {
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
          this.initializeMap();
        } else {
          console.error('Contenedor del mapa no encontrado');
        }
      }, 100);
    }
  }

  cargarDestino(id: number): void {
    this.destinoService.getById(id).subscribe({
      next: data => {
        this.destino = data;
        console.log('Destino cargado:', this.destino);

        // Si el mapa ya está inicializado y tenemos coordenadas, actualizar
        if (this.mapInitialized && this.destino?.latitud && this.destino?.longitud) {
          this.updateMapLocation();
        }
        // Si no está inicializado pero tenemos el contenedor, inicializar ahora
        else if (!this.mapInitialized && this.mapContainer && this.mapContainer.nativeElement && this.destino?.latitud && this.destino?.longitud) {
          this.initializeMap();
        }
      },
      error: err => {
        console.error('Error al cargar destino', err);
      }
    });
  }

  initializeMap(): void {
    // Verificar que el contenedor existe
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      console.error('Contenedor del mapa no está disponible');
      return;
    }

    // Verificar que no esté ya inicializado
    if (this.mapInitialized || this.map) {
      console.log('Mapa ya inicializado');
      return;
    }

    try {
      // Configurar iconos por defecto de Leaflet
      this.setupLeafletIcons();

      // Determinar coordenadas iniciales
      let centerLat = -12.0464; // Lima, Perú por defecto
      let centerLng = -77.0428;
      let initialZoom = 6;

      // Si ya tenemos datos del destino, usar sus coordenadas
      if (this.destino?.latitud && this.destino?.longitud) {
        const lat = parseFloat(this.destino.latitud);
        const lng = parseFloat(this.destino.longitud);

        if (!isNaN(lat) && !isNaN(lng)) {
          centerLat = lat;
          centerLng = lng;
          initialZoom = 15; // Zoom más cercano cuando tenemos coordenadas específicas
          console.log(`Inicializando mapa centrado en: ${lat}, ${lng}`);
        }
      }

      // Crear el mapa con Leaflet
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [centerLat, centerLng],
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
      });

      // Agregar capa de OpenStreetMap (Gratuita y de alta calidad)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 1
      }).addTo(this.map);

      // Marcar como inicializado
      this.mapInitialized = true;

      // Si tenemos datos del destino, agregar marcador
      if (this.destino?.latitud && this.destino?.longitud) {
        this.addMarkerAndPopup();
      }

      console.log('Mapa Leaflet inicializado correctamente');

    } catch (error) {
      console.error('Error al inicializar Leaflet:', error);
      this.mapInitialized = false;
    }
  }

  setupLeafletIcons(): void {
    // Configurar iconos por defecto de Leaflet
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';

    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;
  }

  addMarkerAndPopup(): void {
    if (!this.map || !this.destino?.latitud || !this.destino?.longitud) return;

    const lat = parseFloat(this.destino.latitud);
    const lng = parseFloat(this.destino.longitud);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Coordenadas inválidas:', this.destino.latitud, this.destino.longitud);
      return;
    }

    // Remover marcador anterior si existe
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    // Crear icono personalizado
    const customIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e88e5" width="30" height="30">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `),
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    // Crear marcador
    this.marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(this.map);

    // Crear popup con información del destino
    const popupContent = `
      <div style="padding: 8px; font-family: 'Segoe UI', sans-serif; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1e88e5; font-size: 16px; font-weight: 600;">
          ${this.destino.nombre}
        </h4>
        <div style="margin: 4px 0; font-size: 13px; color: #666; display: flex; align-items: center;">
          <span style="margin-right: 6px;">📍</span>
          <span>${this.destino.ubicacion}</span>
        </div>
        <div style="margin: 4px 0; font-size: 13px; color: #666; display: flex; align-items: center;">
          <span style="margin-right: 6px;">⭐</span>
          <span>Rating: <strong>${this.destino.rating}/10</strong></span>
        </div>
        <div style="margin: 4px 0; font-size: 13px; color: #666; display: flex; align-items: center;">
          <span style="margin-right: 6px;">💰</span>
          <span>Desde <strong>S/. ${this.destino.preciomedio}</strong></span>
        </div>
        <div style="margin: 6px 0 2px 0; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 4px;">
          <strong>Coordenadas:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
      </div>
    `;

    this.marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    }).openPopup();

    console.log(`Marcador agregado en: ${lat}, ${lng}`);
  }

  updateMapLocation(): void {
    if (!this.map || !this.mapInitialized || !this.destino?.latitud || !this.destino?.longitud) {
      console.log('No se puede actualizar ubicación: faltan datos o mapa no inicializado');
      return;
    }

    try {
      const lat = parseFloat(this.destino.latitud);
      const lng = parseFloat(this.destino.longitud);

      if (isNaN(lat) || isNaN(lng)) {
        console.error('Coordenadas inválidas:', this.destino.latitud, this.destino.longitud);
        return;
      }

      console.log(`Actualizando mapa a coordenadas: ${lat}, ${lng}`);

      // Centrar el mapa con animación suave
      this.map.setView([lat, lng], 15, {
        animate: true,
        duration: 2
      });

      // Agregar marcador y popup
      this.addMarkerAndPopup();

      console.log('Ubicación del mapa actualizada correctamente');

    } catch (error) {
      console.error('Error al actualizar ubicación del mapa:', error);
    }
  }

  /**
   * Verificar si el mapa puede ser mostrado
   */
  get puedeEjecutarMapa(): boolean {
    return this.destino?.latitud &&
      this.destino?.longitud &&
      !isNaN(parseFloat(this.destino.latitud)) &&
      !isNaN(parseFloat(this.destino.longitud));
  }

  /**
   * Método para obtener coordenadas formateadas
   */
  getCoordinatesText(): string {
    if (!this.destino?.latitud || !this.destino?.longitud) return 'No disponible';
    return `${this.destino.latitud}, ${this.destino.longitud}`;
  }

  /**
   * Método para abrir en Google Maps
   */
  abrirEnGoogleMaps(): void {
    if (this.destino?.latitud && this.destino?.longitud) {
      const url = `https://www.google.com/maps?q=${this.destino.latitud},${this.destino.longitud}`;
      window.open(url, '_blank');
    }
  }

  /**
   * Método para copiar coordenadas al portapapeles
   */
  async copiarCoordenadas(): Promise<void> {
    const coordinates = this.getCoordinatesText();
    if (coordinates && coordinates !== 'No disponible') {
      try {
        await navigator.clipboard.writeText(coordinates);
        console.log('Coordenadas copiadas al portapapeles');
        alert('Coordenadas copiadas al portapapeles');
      } catch (error) {
        console.error('Error al copiar coordenadas:', error);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = coordinates;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Coordenadas copiadas al portapapeles');
      }
    }
  }

  /**
   * Método para centrar el mapa en la ubicación
   */
  centrarMapa(): void {
    if (this.map && this.mapInitialized && this.destino?.latitud && this.destino?.longitud) {
      const lat = parseFloat(this.destino.latitud);
      const lng = parseFloat(this.destino.longitud);

      this.map.setView([lat, lng], 17, {
        animate: true,
        duration: 1.5
      });
    }
  }

  /**
   * Cambiar estilo del mapa
   */
  cambiarEstiloMapa(estilo: string): void {
    if (!this.map) return;

    // Remover todas las capas de tiles
    this.map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        this.map!.removeLayer(layer);
      }
    });

    // Agregar nueva capa según el estilo
    let tileLayer: L.TileLayer;

    switch (estilo) {
      case 'satellite':
        tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
        });
        break;
      case 'terrain':
        tileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenTopoMap (CC-BY-SA)'
        });
        break;
      case 'dark':
        tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors, © CARTO'
        });
        break;
      default: // 'streets'
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        });
    }

    tileLayer.addTo(this.map);
  }

  /**
   * Método para ver paquetes relacionados con este destino
   */
  verPaquetes(): void {
    this.router.navigate(['/public/paquetes'], {
      queryParams: { destino: this.destino.id || this.destino.idDestino }
    });
  }

  /**
   * Método para ir al login
   */
  irAlLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
  }

  /**
   * Método para ir al registro
   */
  irAlRegistro(): void {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    // Limpiar recursos al destruir el componente
    try {
      if (this.marker && this.map) {
        this.map.removeLayer(this.marker);
        this.marker = null;
      }

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.mapInitialized = false;

    } catch (error) {
      console.error('Error al limpiar recursos del mapa:', error);
    }
  }
}
