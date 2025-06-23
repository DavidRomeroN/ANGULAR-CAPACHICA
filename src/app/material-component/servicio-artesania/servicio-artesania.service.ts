import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioArtesaniaService {
  private apiUrl = 'http://localhost:8080/servicioartesania';

  constructor(private http: HttpClient) {}

  // ✅ MÉTODOS EXISTENTES
  getArtesanias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createArtesania(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateArtesania(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteArtesania(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🚀 NUEVOS MÉTODOS PARA LA VISTA DETALLADA

  /**
   * Obtener un servicio de artesanía por ID
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear solicitud de taller (si tienes este endpoint)
   */
  crearSolicitudTaller(solicitud: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitudes`, solicitud);
  }

  /**
   * Obtener solicitudes del usuario (si tienes este endpoint)
   */
  obtenerSolicitudesUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/usuario/${usuarioId}`);
  }
}
