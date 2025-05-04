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
}
