import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  ChartComponent
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { PaquetesService } from 'src/app/material-component/paquetes/paquetes.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
};

@Component({
  selector: 'app-sales-overview',
  standalone: true,
  templateUrl: './sales-overview.component.html',
  imports: [CommonModule, NgApexchartsModule, DemoMaterialModule]
})
export class SalesOverviewComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  public chartOptions: ChartOptions = {
    series: [{ name: 'Paquetes', data: [] }],
    chart: {
      type: 'bar',
      height: 320,
      fontFamily: 'Poppins, sans-serif'
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '30%',
        borderRadius: 8
      }
    },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      type: 'category',
      categories: [],
      labels: {
        style: { fontSize: '13px', fontFamily: 'Poppins, sans-serif' }
      }
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: { text: 'Cantidad de paquetes' },
      labels: {
        formatter: (value: number) => value >= 1000 ? `${value / 1000}K` : value.toFixed(0),
        style: { fontSize: '13px' }
      }
    },
    fill: { opacity: 1, colors: ['#fb8c00'] },
    tooltip: { theme: 'dark' },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(0,0,0,.2)',
      strokeDashArray: 3
    }
  };

  anosDisponibles: number[] = [];
  anoSeleccionado: number = new Date().getFullYear();

  constructor(
    private paqueteService: PaquetesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerRangoDeAnos();
  }

  obtenerRangoDeAnos(): void {
    this.paqueteService.getAll().subscribe({
      next: (paquetes: any[]) => {
        const anosUnicos = new Set<number>();
        paquetes.forEach((p) => {
          const rawFecha = p.fechaInicio || p.fecha_inicio;
          const fecha = new Date(rawFecha);
          if (!isNaN(fecha.getTime())) {
            anosUnicos.add(fecha.getFullYear());
          }
        });
        this.anosDisponibles = Array.from(anosUnicos).sort((a, b) => b - a);
        this.anoSeleccionado = this.anosDisponibles[0] || new Date().getFullYear();
        this.cargarDatosPaquetes();
      },
      error: (err) => console.error('❌ Error al obtener anos:', err)
    });
  }

  cargarDatosPaquetes(): void {
    this.paqueteService.getAll().subscribe({
      next: (paquetes: any[]) => {
        const conteoPorMes = new Array(12).fill(0);
        paquetes.forEach((p) => {
          const rawFecha = p.fechaInicio || p.fecha_inicio;
          const fecha = new Date(rawFecha);
          if (!isNaN(fecha.getTime()) && fecha.getFullYear() === this.anoSeleccionado) {
            const mes = fecha.getMonth(); // Enero = 0
            conteoPorMes[mes]++;
          }
        });

        const maxCantidad = Math.max(...conteoPorMes);
        const padding = Math.ceil(maxCantidad * 0.1);

        this.chartOptions.series[0].data = conteoPorMes;
        this.chartOptions.xaxis.categories = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        this.chartOptions.yaxis = {
          min: 0,
          max: maxCantidad + padding,
          forceNiceScale: true,
          title: { text: 'Cantidad de paquetes' },
          labels: {
            formatter: (value: number) => value >= 1000 ? `${value / 1000}K` : value.toFixed(0),
            style: { fontSize: '13px' }
          }
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error al cargar paquetes:', err)
    });
  }
}
