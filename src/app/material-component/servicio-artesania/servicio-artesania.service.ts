import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioArtesaniaService {
  private apiUrl = 'http://localhost:8080/servicioartesania';

  constructor(private http: HttpClient) {}

  getArtesanias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createArtesania(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateArtesania(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteArtesania(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
