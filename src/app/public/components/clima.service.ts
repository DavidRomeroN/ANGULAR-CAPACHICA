import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClimaService {
  private apiUrl = 'http://localhost:8080/api/clima';

  constructor(private http: HttpClient) {}

  getForecast(lat: number, lon: number, dia: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/forecast?latitud=${lat}&longitud=${lon}&dia=${dia}`);
  }
}
