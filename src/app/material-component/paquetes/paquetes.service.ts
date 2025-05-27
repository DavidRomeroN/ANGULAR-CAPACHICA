import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaquetesService {
  private apiURL = 'http://localhost:8080/paquetes';
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
    return {}; // Sin headers para FormData
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  create(paquete: any): Observable<any> {
    // Si es FormData, no enviamos headers Content-Type
    if (paquete instanceof FormData) {
      return this.http.post(this.apiURL, paquete, this.getFormDataHttpOptions());
    }
    // Si es JSON, enviamos con headers JSON
    return this.http.post(this.apiURL, paquete, this.getJsonHttpOptions());
  }

  update(id: number, paquete: any): Observable<any> {
    // Si es FormData, no enviamos headers Content-Type
    if (paquete instanceof FormData) {
      return this.http.put(`${this.apiURL}/${id}`, paquete, this.getFormDataHttpOptions());
    }
    // Si es JSON, enviamos con headers JSON
    return this.http.put(`${this.apiURL}/${id}`, paquete, this.getJsonHttpOptions());
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
