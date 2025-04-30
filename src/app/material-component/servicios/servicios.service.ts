import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = 'http://localhost:8080/servicios';

  constructor(private http: HttpClient) {}

  // Obtener todos los servicios
  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Crear un nuevo servicio
  createServicio(servicio: any): Observable<any> {
    return this.http.post(this.apiUrl, servicio);
  }

  // Actualizar servicio por ID
  updateServicio(id: number, servicio: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, servicio);
  }

  // Eliminar servicio por ID
  deleteServicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtener un servicio por ID (opcional si necesitas usarlo)
  getServicioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
