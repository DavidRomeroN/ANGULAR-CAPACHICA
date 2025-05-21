// destinos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestinosService {
  private apiUrl = 'http://localhost:8080/destinos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(destino: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, destino);
  }

  update(id: number, destino: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, destino);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
