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

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  /** Obtener todos los paquetes */
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  /**
   * Crear paquete usando FormData (multipart/form-data):
   * - dto (Blob con JSON)
   * - imagenFile (archivo)
   */
  createFormData(formData: FormData): Observable<any> {
    return this.http.post(this.apiURL, formData);
  }

  /** Actualizar paquete (envía JSON) */
  update(id: number, paquete: any): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, paquete, this.getHttpOptions());
  }

  /** Eliminar paquete */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  /** Obtener paquete por ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${id}`);
  }

  /** Obtener todos los destinos */
  getAllDestinos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiDestinosURL);
  }

  /** Obtener todos los proveedores */
  getAllProveedores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiProveedoresURL);
  }

  /** Obtener destino por ID */
  getDestinoPorId(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/destinos/${id}`);
  }

  /** Obtener proveedor por ID */
  getProveedorPorId(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/proveedores/${id}`);
  }
}
