import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservadosService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  obtenerReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reservas`);
  }

  actualizarReserva(dto: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reservas/${id}`, dto);
  }
}
