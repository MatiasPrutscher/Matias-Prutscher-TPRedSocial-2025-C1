import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstadisticasService } from '../../services/estadisticas/estadisticas.service';

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [NgChartsModule, FormsModule, CommonModule],
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrls: ['./dashboard-estadisticas.component.css'],
})
export class DashboardEstadisticasComponent implements OnInit {
  chartType: ChartType = 'bar';
  chartData: any = {
    labels: [],
    datasets: [
      {
        label: 'Publicaciones',
        data: [],
        backgroundColor: [],
        borderColor: '#18191a',
        borderWidth: 2,
        hoverBackgroundColor: [],
      },
    ],
  };

  primerFecha: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  tipoEstadistica: string = 'publicaciones';

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit() {
    this.estadisticasService.getPrimerFechaPublicacion().subscribe((res) => {
      // Convertir a yyyy-MM-dd
      this.primerFecha = res.fecha.substring(0, 10);
      this.fechaDesde = this.primerFecha;
      this.fechaHasta = new Date().toISOString().substring(0, 10);
      this.cargarDatos();
    });
  }

  cargarDatos() {
    // Configurar fechas para evitar errores por zona horaria
    const desdeDate = new Date(this.fechaDesde);
    const hastaDate = new Date(this.fechaHasta);

    desdeDate.setUTCHours(0, 0, 0, 0);
    hastaDate.setUTCHours(23, 59, 59, 999);

    const fechaDesdeUTC = desdeDate.toISOString();
    const fechaHastaUTC = hastaDate.toISOString();

    if (this.tipoEstadistica === 'publicaciones') {
      this.estadisticasService
        .getPublicacionesPorUsuario(fechaDesdeUTC, fechaHastaUTC)
        .subscribe((data) => {
          this.chartData.labels = data.map((d) => d.usuario);
          this.chartData.datasets[0].data = data.map((d) => d.cantidad);
          this.chartData.datasets[0].label = 'Publicaciones';
          this.updateColors();
        });
    } else if (this.tipoEstadistica === 'comentariosPorUsuario') {
      this.estadisticasService
        .getComentariosPorUsuario(fechaDesdeUTC, fechaHastaUTC)
        .subscribe((data) => {
          this.chartData.labels = data.map((d) => d.usuario);
          this.chartData.datasets[0].data = data.map((d) => d.cantidad);
          this.chartData.datasets[0].label = 'Comentarios por usuario';
          this.updateColors();
        });
    } else if (this.tipoEstadistica === 'comentariosPorPublicacion') {
      this.estadisticasService
        .getComentariosPorPublicacion(fechaDesdeUTC, fechaHastaUTC)
        .subscribe((data) => {
          this.chartData.labels = data.map(
            (d) =>
              (Array.isArray(d.titulo) ? d.titulo[0] : d.titulo) || 'Sin título'
          );
          this.chartData.datasets[0].data = data.map((d) => d.cantidad);
          this.chartData.datasets[0].label = 'Comentarios por publicación';
          this.updateColors();
        });
    }
  }

  get chartOptions(): ChartOptions {
    let title = '';
    switch (this.tipoEstadistica) {
      case 'publicaciones':
        title = 'Publicaciones por usuario';
        break;
      case 'comentariosPorUsuario':
        title = 'Comentarios por usuario';
        break;
      case 'comentariosPorPublicacion':
        title = 'Comentarios por publicación';
        break;
      default:
        title = 'Estadísticas';
    }

    const tooMany = this.chartData.labels.length > 15;
    if (this.chartType === 'pie' || this.chartType === 'doughnut') {
      return {
        responsive: true,
        plugins: {
          legend: {
            display: !tooMany,
            labels: { color: '#00bfff', font: { size: 14, weight: 'bold' } },
            position: 'top',
          },
          title: {
            display: true,
            text: title,
            color: '#8a2be2',
            font: { size: 18, weight: 'bold' },
          },
        },
      };
    }
    // Barras/líneas
    return {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#00bfff', font: { size: 14, weight: 'bold' } },
        },
        title: {
          display: true,
          text: title,
          color: '#8a2be2',
          font: { size: 18, weight: 'bold' },
        },
      },
      scales: {
        x: { ticks: { color: '#efefef' }, grid: { color: '#2a2a2a' } },
        y: { ticks: { color: '#efefef' }, grid: { color: '#2a2a2a' } },
      },
    };
  }

  ngOnChanges() {
    this.updateColors();
  }

  ngDoCheck() {
    this.updateColors();
  }

  updateColors() {
    const count = this.chartData.labels.length;
    if (this.chartType === 'pie' || this.chartType === 'doughnut') {
      this.chartData.datasets[0].backgroundColor = this.generateColors(count);
      this.chartData.datasets[0].hoverBackgroundColor = this.generateColors(
        count
      ).map((c) => c + 'cc');
      this.chartData.datasets[0].borderColor = '#18191a';
    } else {
      const colors = this.generateColors(count);
      this.chartData.datasets[0].backgroundColor = colors;
      this.chartData.datasets[0].hoverBackgroundColor = colors.map(
        (c) => c + 'cc'
      );
      this.chartData.datasets[0].borderColor = '#8a2be2';
    }
  }

  // Genera cualquier cantidad de colores automáticamente usando HSL
  generateColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsl(${hue}, 100%, 50%)`);
    }
    return colors;
  }

  get hoy() {
    return new Date().toISOString().substring(0, 10);
  }
}
