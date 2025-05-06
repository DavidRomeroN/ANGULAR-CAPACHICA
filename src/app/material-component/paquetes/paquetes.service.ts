import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaquetesService {
  private apiURL = 'http://localhost:8080/paquetes';
  private apiDestinosURL = 'http://localhost:8080/destinos/ids'; // Endpoint para obtener destinos
  private apiProveedoresURL = 'http://localhost:8080/proveedores/ids'; // Endpoint para obtener proveedores

  constructor(private http: HttpClient) {}

  // Configuración de headers HTTP
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  create(paquete: any): Observable<any> {
    return this.http.post(this.apiURL, paquete, this.getHttpOptions());
  }

  update(id: number, paquete: any): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, paquete, this.getHttpOptions());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${id}`);
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
}
