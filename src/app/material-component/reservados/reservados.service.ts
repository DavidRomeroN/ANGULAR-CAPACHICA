import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservadosService {
  private baseUrl = 'http://localhost:8080/reservas'; // Asegúrate de tener este endpoint

  constructor(private http: HttpClient) {}

  obtenerReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  actualizarEstadoCompleto(reserva: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reserva.idReserva}`, {
      idReserva: reserva.idReserva,
      fechaInicio: reserva.fechaInicio,
      fechaFin: reserva.fechaFin,
      estado: reserva.estado,
      cantidadPersonas: reserva.cantidadPersonas,
      observaciones: reserva.observaciones,
      usuario: reserva.usuario.idUsuario,
      paquete: reserva.paquete.idPaquete
    });
  }

}
