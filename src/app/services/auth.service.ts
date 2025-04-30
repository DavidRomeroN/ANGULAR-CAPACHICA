import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/users/login';

  constructor(private http: HttpClient) {}

  login(credentials: { user: string, clave: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response)); // guarda todo si quieres
      })
    );
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
