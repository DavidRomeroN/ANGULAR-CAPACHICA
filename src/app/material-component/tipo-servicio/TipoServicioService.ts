import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoServicioService {
  private apiUrl = 'http://localhost:8080/tipos';

  constructor(private http: HttpClient) {}

  getTipos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createTipo(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateTipo(id: number, tipo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, tipo);
  }

  deleteTipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
