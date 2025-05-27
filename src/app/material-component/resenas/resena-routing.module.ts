import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private apiUrl = 'http://localhost:8080/resenas';

  constructor(private http: HttpClient) {}

  getResenas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteResena(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
