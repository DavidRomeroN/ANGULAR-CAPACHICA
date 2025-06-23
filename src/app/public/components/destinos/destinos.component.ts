
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DestinosService } from "../../../material-component/destinos/destinos.service";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Destino {
  idDestino: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  imagenUrl: string;
  popularidad: number;
  latitud: number;
  longitud: number;
  temperatura?: string;
  mensajeClimaDestino?: string;
}

interface ClimaResponse {
  ideal: boolean;
  temperatura: number;
  fecha: string;
  mensaje: string;
  error?: string;
}

@Component({
  selector: 'app-destinos',
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.scss']
})
export class DestinosComponent implements OnInit {

  destinos: Destino[] = [];
  climaRecomendados: Destino[] = [];
  isLoading: boolean = true;
  isLoadingClima: boolean = false;
  error: string | null = null;
  mensajeClima: string = '';
  fechasSugeridas: { fecha: string, label: string }[] = [];
  fechaSeleccionada: string | null = null;
  filtroNombre: string = '';

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  constructor(
    private destinosService: DestinosService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.generarFechasDesdeHoy();
    this.cargarDestinos();
  }

  generarFechasDesdeHoy(): void {
    const hoy = new Date();
    this.fechasSugeridas = [];

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      const iso = fecha.toISOString().split('T')[0];
      const diaSemana = diasSemana[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];

      let label = '';
      if (i === 0) {
        label = `Hoy (${dia} ${mes})`;
      } else if (i === 1) {
        label = `Mañana (${dia} ${mes})`;
      } else {
        label = `${diaSemana} ${dia} ${mes}`;
      }

      this.fechasSugeridas.push({ fecha: iso, label });
    }
  }

  cargarDestinos(): void {
    this.destinosService.getAll().subscribe({
      next: (data) => {
        this.destinos = data;
        this.isLoading = false;

        // Seleccionamos automáticamente el día 0 (hoy)
        if (this.fechasSugeridas.length > 0) {
          this.seleccionarFecha(this.fechasSugeridas[0].fecha);
        }
      },
      error: (err) => {
        console.error('Error cargando destinos', err);
        this.error = 'Error al cargar destinos. Por favor, intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada = fecha;
    this.isLoadingClima = true;
    this.climaRecomendados = [];
    this.mensajeClima = '';

    const index = this.fechasSugeridas.findIndex(f => f.fecha === fecha);
    if (index === -1) {
      console.error('❌ Fecha no encontrada:', fecha);
      return;
    }

    console.log(`🔍 Consultando clima para fecha: ${fecha} (día ${index})`);
    console.log(`📊 Total destinos a consultar: ${this.destinos.length}`);

    const destinosRecomendados: Destino[] = [];
    let consultasCompletadas = 0;

    this.destinos.forEach((destino, destinoIndex) => {
      const url = `http://localhost:8080/api/clima/forecast?latitud=${destino.latitud}&longitud=${destino.longitud}&dia=${index}`;

      console.log(`🌐 Consulta ${destinoIndex + 1}/${this.destinos.length}: ${destino.nombre}`);
      console.log(`🔗 URL: ${url}`);

      this.http.get<any>(url).subscribe({
        next: (res) => {
          console.log(`✅ Respuesta para ${destino.nombre}:`, res);

          // 🔍 DEBUGGING DETALLADO
          console.log(`   - ideal: ${res.ideal} (tipo: ${typeof res.ideal})`);
          console.log(`   - temperatura: ${res.temperatura}`);
          console.log(`   - mensaje: ${res.mensaje}`);
          console.log(`   - error: ${res.error}`);

          // ✅ LÓGICA MEJORADA DE VALIDACIÓN
          const esIdeal = this.validarClimaIdeal(res);
          console.log(`   - ¿Es ideal?: ${esIdeal}`);

          if (esIdeal && !res.error) {
            const destinoCopia: Destino = {
              ...destino,
              temperatura: res.temperatura ? res.temperatura.toFixed(1) : 'N/A',
              mensajeClimaDestino: res.mensaje || 'Clima ideal'
            };
            destinosRecomendados.push(destinoCopia);
            console.log(`   ✅ ${destino.nombre} AGREGADO a recomendados`);
          } else {
            console.log(`   ❌ ${destino.nombre} NO cumple criterios`);
          }

          this.finalizarConsulta(destinosRecomendados, fecha, ++consultasCompletadas);
        },
        error: (error) => {
          console.error(`❌ Error consulta ${destino.nombre}:`, error);
          this.finalizarConsulta(destinosRecomendados, fecha, ++consultasCompletadas);
        }
      });
    });
  }

  private validarClimaIdeal(respuesta: any): boolean {
    // Verificar diferentes formas en que puede venir 'ideal'
    if (respuesta.ideal === true) return true;
    if (respuesta.ideal === 'true') return true;
    if (respuesta.ideal === 1) return true;
    if (respuesta.ideal === '1') return true;

    // También verificar si viene como string boolean
    if (typeof respuesta.ideal === 'string') {
      const idealLower = respuesta.ideal.toLowerCase();
      if (idealLower === 'true' || idealLower === 'yes' || idealLower === 'sí') {
        return true;
      }
    }

    return false;
  }

  private finalizarConsulta(destinosRecomendados: Destino[], fecha: string, consultasCompletadas: number): void {
    console.log(`📊 Consultas completadas: ${consultasCompletadas}/${this.destinos.length}`);

    if (consultasCompletadas === this.destinos.length) {
      console.log(`🎯 RESULTADO FINAL: ${destinosRecomendados.length} destinos recomendados`);
      console.log('📋 Destinos recomendados:', destinosRecomendados.map(d => d.nombre));

      this.climaRecomendados = destinosRecomendados;
      this.isLoadingClima = false;

      // Generar mensaje más descriptivo
      const fechaLabel = this.fechasSugeridas.find(f => f.fecha === fecha)?.label || fecha;

      if (destinosRecomendados.length > 0) {
        this.mensajeClima = `☀️ ¡${destinosRecomendados.length} destinos con clima ideal para ${fechaLabel}!`;
      } else {
        this.mensajeClima = `🌧️ No hay destinos con clima ideal para ${fechaLabel}. Prueba otra fecha.`;
      }

      console.log(`💬 Mensaje final: ${this.mensajeClima}`);
    }
  }


  private procesarResultadosClima(resultados: ClimaResponse[], fecha: string): void {
    const destinosRecomendados: Destino[] = [];

    resultados.forEach((resultado, index) => {
      if (resultado.ideal === true && !resultado.error) {
        const destino = this.destinos[index];
        const destinoCopia: Destino = {
          ...destino,
          temperatura: resultado.temperatura.toFixed(1),
          mensajeClimaDestino: resultado.mensaje
        };
        destinosRecomendados.push(destinoCopia);
      }
    });

    this.climaRecomendados = destinosRecomendados;

    // Generar mensaje más descriptivo
    const fechaLabel = this.fechasSugeridas.find(f => f.fecha === fecha)?.label || fecha;

    if (destinosRecomendados.length > 0) {
      this.mensajeClima = `☀️ ¡${destinosRecomendados.length} destinos con clima ideal para ${fechaLabel}!`;
    } else {
      this.mensajeClima = `🌧️ No hay destinos con clima ideal para ${fechaLabel}. Prueba otra fecha.`;
    }
  }

  verMasDestino(id: number): void {
    this.router.navigate(['/capachica/detalle-destino', id]);
  }

  scrollLeft(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft -= 300;
    }
  }

  scrollRight(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft += 300;
    }
  }

  destinosFiltrados(): Destino[] {
    if (!this.filtroNombre.trim()) {
      return this.climaRecomendados;
    }

    return this.climaRecomendados.filter(destino =>
      destino.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase().trim()) ||
      destino.ubicacion.toLowerCase().includes(this.filtroNombre.toLowerCase().trim())
    );
  }

  trackByDestinoId(index: number, destino: Destino): number {
    return destino.idDestino;
  }

  // Método para reintentar carga de destinos
  reintentarCarga(): void {
    this.error = null;
    this.isLoading = true;
    this.cargarDestinos();
  }

  // Método para limpiar filtro
  limpiarFiltro(): void {
    this.filtroNombre = '';
  }

  onImageError(event: any): void {
    console.warn('Error cargando imagen:', event.target.src);
    event.target.src = 'assets/images/destino-placeholder.jpg';
  }
}
