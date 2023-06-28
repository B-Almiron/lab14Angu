import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];

  generoFiltro: string = '';
  lanzamientoFiltro: number = 0;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
    });
  }

  generarPDF() {
    const peliculasFiltradas = this.peliculas.filter(pelicula => {
      if (this.generoFiltro && pelicula.genero !== this.generoFiltro) {
        return false;
      }
      if (this.lanzamientoFiltro && pelicula.lanzamiento !== this.lanzamientoFiltro) {
        return false;
      }
      return true;
    });

    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Título', style: 'tableHeader' },
              { text: 'Género', style: 'tableHeader' },
              { text: 'Año de lanzamiento', style: 'tableHeader' }
            ],
            ...peliculasFiltradas.map(pelicula => [
              pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()
            ])
          ]
        }
      },
    ];
    const estilos = {
      header: {
        fontSize: 18,
        bold: true,
        fillColor: '#808080',
        color: '#8c0a0a',
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#000000',
        fillColor: '#787bb3'
      }
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  generarExcel() {
    const peliculasFiltradas = this.peliculas.filter(pelicula => {
      if (this.generoFiltro && pelicula.genero !== this.generoFiltro) {
        return false;
      }
      if (this.lanzamientoFiltro && pelicula.lanzamiento !== this.lanzamientoFiltro) {
        return false;
      }
      return true;
    });
  
    const csvData = this.convertToCSV(peliculasFiltradas);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'informe.csv');
  }
  private convertToCSV(data: any[]): string {
    const header = ['Título', 'Género', 'Año de lanzamiento'];
    const rows = data.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()]);
    const csvArray = [header, ...rows];
    return csvArray.map(row => row.join(',')).join('\n');
  }

  exportarCSV() {
    const peliculasFiltradas = this.peliculas.filter(pelicula => {
      if (this.generoFiltro && pelicula.genero !== this.generoFiltro) {
        return false;
      }
      if (this.lanzamientoFiltro && pelicula.lanzamiento !== this.lanzamientoFiltro) {
        return false;
      }
      return true;
    });

    const csvData: any[] = [
      ['Título', 'Género', 'Año de lanzamiento'],
      ...peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()])
    ];

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'informe_peliculas.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
  }
  


}
