import { Component, OnInit, ViewChild } from '@angular/core';
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
  public chartOptions: Partial<ChartOptions> = {}; // ✅ Inicialización segura

  constructor(private paqueteService: PaquetesService) {}

  ngOnInit(): void {
    this.cargarDatosPaquetes();
  }

  cargarDatosPaquetes(): void {
    this.paqueteService.getAll().subscribe({
      next: (paquetes: any[]) => {
        const conteoPorMes: { [mes: string]: number } = {};
        paquetes.forEach((p) => {
          const fecha = new Date(p.fechaInicio);
          const mes = fecha.toLocaleString('default', { month: 'short' });
          conteoPorMes[mes] = (conteoPorMes[mes] || 0) + 1;
        });

        const mesesOrdenados = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const series = mesesOrdenados.map((m) => conteoPorMes[m] || 0);

        this.chartOptions = {
          series: [{ name: 'Paquetes', data: series }],
          chart: {
            type: 'bar',
            height: 320,
            fontFamily: 'Poppins,sans-serif'
          },
          dataLabels: {
            enabled: false
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '30%',
              borderRadius: 8
            }
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
          },
          xaxis: {
            categories: mesesOrdenados
          },
          yaxis: {
            title: {
              text: 'Cantidad de paquetes'
            }
          },
          fill: {
            colors: ['#fb8c00'],
            opacity: 1
          },
          tooltip: {
            theme: 'dark'
          },
          legend: {
            show: false
          },
          grid: {
            borderColor: 'rgba(0,0,0,.2)',
            strokeDashArray: 3
          }
        };
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
      }
    });
  }
}
