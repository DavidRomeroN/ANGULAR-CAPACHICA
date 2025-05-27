import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrearreservaService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  obtenerPaquetePorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/paquetes/${id}`);
  }

  crearReserva(reserva: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas`, reserva);
  }
}
