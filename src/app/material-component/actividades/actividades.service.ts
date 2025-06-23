import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private apiUrl = 'http://localhost:8080/actividad';
  private apiDestinosURL = 'http://localhost:8080/destinos';
  private apiProveedoresURL = 'http://localhost:8080/proveedores';
  private apiActividadDetalleURL = 'http://localhost:8080/actividad-detalle';

  constructor(private http: HttpClient) {}

  // Headers JSON
  private getJsonHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  // Headers para FormData (el navegador gestiona Content-Type)
  private getFormDataHttpOptions() {
    return {};
  }

  // CRUD BÁSICO
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    if (data instanceof FormData) {
      return this.http.post(this.apiUrl, data, this.getFormDataHttpOptions());
    }
    return this.http.post(this.apiUrl, data, this.getJsonHttpOptions());
  }

  update(id: number, data: any): Observable<any> {
    if (data instanceof FormData) {
      return this.http.put(`${this.apiUrl}/${id}`, data, this.getFormDataHttpOptions());
    }
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getJsonHttpOptions());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // FUNCIONALIDADES EXTRA

  getRecomendadas(dia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recomendadas?dia=${dia}`);
  }

  getActividadDetalleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiActividadDetalleURL}/${id}`);
  }

  // DESTINOS Y PROVEEDORES

  getAllDestinos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiDestinosURL}/ids`);
  }

  getDestinoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiDestinosURL}/${id}`);
  }

  getAllProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiProveedoresURL}/ids`);
  }

  getProveedorPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiProveedoresURL}/${id}`);
  }
}
