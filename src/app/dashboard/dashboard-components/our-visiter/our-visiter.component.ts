/*
import { Component, ViewChild, OnInit } from '@angular/core';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexStroke,
  NgApexchartsModule
} from 'ng-apexcharts';
import { TipoServicioService } from 'src/app/material-component/tipo-servicio/TipoServicioService';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from 'src/app/demo-material-module';

export type ActividadChartOptions = Partial<{
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
}>;

@Component({
  selector: 'app-our-visiter',
  standalone: true,
  templateUrl: './our-visiter.component.html',
  imports: [NgApexchartsModule, DemoMaterialModule, CommonModule]
})
export class OurVisiterComponent implements OnInit {
  @ViewChild('actividad-chart') chart: ChartComponent = Object.create(null);

  public actividadChartOptions: ActividadChartOptions = {};
  public datosCargados: boolean = false;

  constructor(private tipoServicioService: TipoServicioService) {}

  ngOnInit(): void {
    this.tipoServicioService.getTipos().subscribe((tipos) => {
      const labels = tipos.map((t: any) => t.nombre);
      const series = tipos.map(() => Math.floor(Math.random() * 10 + 1)); // Simulado

      this.actividadChartOptions = {
        series,
        chart: {
          type: 'donut',
          height: 253,
          fontFamily: 'Poppins, sans-serif'
        },
        labels,
        responsive: [
          {
            breakpoint: 767,
            options: {
              chart: {
                width: 200
              }
            }
          }
        ],
        tooltip: {
          y: {
            formatter: function (val: number) {
              return `${val} paquetes`;
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom'
        },
        colors: ['#1e88e5', '#26c6da', '#745af2', '#ffc107', '#66bb6a', '#ec407a'],
        stroke: {
          width: 0
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return val.toFixed(1) + '%';
          },
          style: {
            fontSize: '13px',
            fontWeight: 'bold',
            colors: ['#fff']
          }
        },

        plotOptions: {
          pie: {
            donut: {
              size: '60%'
            }
          }
        }

      };

      this.datosCargados = true;
    });
  }
}
*/
