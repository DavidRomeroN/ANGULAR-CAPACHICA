import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/users/ids'; // Ajusta esto según tu backend

  constructor(private http: HttpClient) {}

  // Método para obtener los IDs de los usuarios
  getUserIds(): Observable<number[]> {
    return this.http.get<number[]>(this.apiUrl); // Corrige la URL
  }
}
