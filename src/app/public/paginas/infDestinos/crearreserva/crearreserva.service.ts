import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrearreservaService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  obtenerPaquetePorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/paquetes/${id}`);
  }

  crearReserva(reserva: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas`, reserva);
  }

  // ✅ Método mejorado para obtener reservas del usuario con información del paquete
  obtenerMisReservas(usuarioId: number): Observable<any[]> {
    if (!usuarioId) {
      console.error('ID de usuario no válido');
      return of([]);
    }

    // Usando HttpParams para construir la query string de forma segura
    const params = new HttpParams().set('usuarioId', usuarioId.toString());

    return this.http.get<any[]>(`${this.baseUrl}/reservas/usuario/${usuarioId}`)
      .pipe(
        catchError(error => {
          console.error('Error en obtenerMisReservas:', error);
          // Si falla la ruta con JOIN, intenta la ruta básica
          return this.http.get<any[]>(`${this.baseUrl}/reservas`, { params })
            .pipe(
              catchError(() => of([]))
            );
        })
      );
  }

  // ✅ Método para obtener reservas con detalles completos (JOIN con paquetes)
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
}
