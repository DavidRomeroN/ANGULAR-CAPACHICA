import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {

  private baseUrl = 'http://localhost:8080/actividad';

  constructor(private http: HttpClient) {}

  obtenerRecomendaciones(dia: number = 0) {
    return this.http.get(`${this.baseUrl}/asesor?dia=${dia}`);
  }
}
