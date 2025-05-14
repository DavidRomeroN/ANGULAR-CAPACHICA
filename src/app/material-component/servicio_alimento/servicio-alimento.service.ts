import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioAlimentoService {
  private apiUrl = 'http://localhost:8080/servicioalimento';

  constructor(private http: HttpClient) {}

  getAlimentos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createAlimento(alimento: any): Observable<any> {
    return this.http.post(this.apiUrl, alimento);
  }

  updateAlimento(id: number, alimento: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, alimento);
  }

  deleteAlimento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
