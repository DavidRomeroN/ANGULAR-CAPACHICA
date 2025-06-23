import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioHoteleriaService {
  private apiUrl = 'http://localhost:8080/serviciohoteles';

  constructor(private http: HttpClient) {}

  getHoteles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createHoteleria(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateHoteleria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteHoteleria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
