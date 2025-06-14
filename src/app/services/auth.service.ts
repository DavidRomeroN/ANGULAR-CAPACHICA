import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseApiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  // Método de login
  login(credentials: { email: string, clave: string }): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuarioLogueado', JSON.stringify({
          idUsuario: response.idUsuario,
          email: response.email
        }));
      })
    );
  }

  // Método de registro
  register(userData: { email: string; clave: string; verificado?: string }): Observable<string> {
    return this.http.post(`${this.baseApiUrl}/register`, userData, {
      responseType: 'text'
    }).pipe(
      tap(response => {
        console.log('Respuesta del registro:', response);
      })
    );
  }

  // ✅ ACTUALIZADO: Verificar email con token desde URL y auto-login
  verifyEmailByToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/verify?token=${token}`).pipe(
      tap(response => {
        console.log('Respuesta de verificación:', response);

        // ✅ Si la verificación incluye datos de login, guardarlos automáticamente
        if (response.token && response.email) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuarioLogueado', JSON.stringify({
            idUsuario: response.idUsuario,
            email: response.email
          }));
          console.log('Usuario auto-logueado después de verificación');
        }
      })
    );
  }

  // Método alternativo para verificar con código
  verifyEmailWithCode(verificationData: { email: string; verificationCode: string }): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/verify-email`, verificationData);
  }

  // Reenviar código de verificación
  resendVerificationCode(emailData: { email: string }): Observable<string> {
    return this.http.post(`${this.baseApiUrl}/resend-verification`, emailData, {
      responseType: 'text'
    }).pipe(
      tap(response => {
        console.log('Respuesta de reenvío:', response);
      })
    );
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuarioLogueado');
    return !!(token && usuario);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogueado');
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener usuario logueado
  getLoggedUser(): any {
    const usuario = localStorage.getItem('usuarioLogueado');
    return usuario ? JSON.parse(usuario) : null;
  }

  // Verificar si el token es válido
  validateToken(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/validate-token`);
  }
}
