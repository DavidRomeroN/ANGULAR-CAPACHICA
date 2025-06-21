import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private apiURL = 'http://localhost:8080/actividad';
  private apiDestinosURL = 'http://localhost:8080/destinos/ids';
  private apiProveedoresURL = 'http://localhost:8080/proveedores/ids';

  constructor(private http: HttpClient) {}

  // Configuración de headers HTTP para JSON
  private getJsonHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  // Para FormData, NO establecemos Content-Type (el browser lo hace automáticamente)
  private getFormDataHttpOptions() {
    return {};
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${id}`);
  }

  create(actividad: any): Observable<any> {
    if (actividad instanceof FormData) {
      return this.http.post(this.apiURL, actividad, this.getFormDataHttpOptions());
    }
    return this.http.post(this.apiURL, actividad, this.getJsonHttpOptions());
  }

  update(id: number, actividad: any): Observable<any> {
    if (actividad instanceof FormData) {
      return this.http.put(`${this.apiURL}/${id}`, actividad, this.getFormDataHttpOptions());
    }
    return this.http.put(`${this.apiURL}/${id}`, actividad, this.getJsonHttpOptions());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  getAllDestinos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiDestinosURL);
  }

  getAllProveedores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiProveedoresURL);
  }

  getDestinoPorId(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/destinos/${id}`);
  }

  getProveedorPorId(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/proveedores/${id}`);
  }
  getActividadDetalleById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/actividad-detalle/${id}`);
  }

}
