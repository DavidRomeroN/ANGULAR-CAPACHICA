import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrearreservaService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Métodos para paquetes
  obtenerPaquetePorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/paquetes/${id}`);
  }

  // ✅ CORREGIDO: Método para actividades
  obtenerActividadPorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/actividad/${id}`); // Cambiado de /paquetes a /actividad
  }

  // Método unificado para crear reservas (paquetes y actividades)
  crearReserva(reserva: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas`, reserva);
  }

  // ✅ Método mejorado para obtener reservas del usuario con información del paquete
  obtenerMisReservas(usuarioId: number): Observable<any[]> {
    if (!usuarioId) {
      console.error('ID de usuario no válido');
      return of([]);
    }

    const params = new HttpParams().set('usuarioId', usuarioId.toString());

    return this.http.get<any[]>(`${this.baseUrl}/reservas/usuario/${usuarioId}`)
      .pipe(
        catchError(error => {
          console.error('Error en obtenerMisReservas:', error);
          return this.http.get<any[]>(`${this.baseUrl}/reservas`, { params })
            .pipe(
              catchError(() => of([]))
            );
        })
      );
  }

  // ✅ Método para obtener reservas con detalles completos (JOIN con paquetes y actividades)
  obtenerReservasConPaquetes(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reservas/completas?usuarioId=${usuarioId}`)
      .pipe(
        catchError(error => {
          console.error('Error en obtenerReservasConPaquetes:', error);
          return of([]);
        })
      );
  }

  // ✅ Método alternativo si tu backend usa una ruta diferente
  obtenerReservasPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios/${usuarioId}/reservas`)
      .pipe(
        catchError(error => {
          console.error('Error en obtenerReservasPorUsuario:', error);
          return of([]);
        })
      );
  }

  // ✅ NUEVOS MÉTODOS para reservas específicas por tipo

  // Crear reserva de paquete
  crearReservaPaquete(reserva: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas/paquete`, reserva);
  }

  // Crear reserva de actividad
  crearReservaActividad(reserva: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas/actividad`, reserva);
  }

  // Obtener reservas de paquetes del usuario
  obtenerMisReservasPaquetes(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reservas/usuario/${usuarioId}/paquetes`)
      .pipe(
        catchError(error => {
          console.error('Error en obtenerMisReservasPaquetes:', error);
          return of([]);
        })
      );
  }

  // Obtener reservas de actividades del usuario
  obtenerMisReservasActividades(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reservas/usuario/${usuarioId}/actividades`)
      .pipe(
        catchError(error => {
          console.error('Error en obtenerMisReservasActividades:', error);
          return of([]);
        })
      );
  }

  // Método para cancelar reserva
  cancelarReserva(reservaId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reservas/${reservaId}/cancelar`, {});
  }

  // Método para actualizar estado de reserva
  actualizarEstadoReserva(reservaId: number, estado: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/reservas/${reservaId}/estado`, { estado });
  }
}
