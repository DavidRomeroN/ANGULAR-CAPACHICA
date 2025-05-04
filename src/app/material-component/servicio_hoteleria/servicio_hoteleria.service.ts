import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioHoteleriaService {
  private apiUrl = 'http://localhost:8080/serviciohoteles';
  private serviciosUrl = 'http://localhost:8080/servicios';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getAuthHeaders());
  }

  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(this.serviciosUrl, this.getAuthHeaders());
  }

  create(dto: any): Observable<any> {
    return this.http.post(this.apiUrl, dto, this.getAuthHeaders());
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto, this.getAuthHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
