import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseApiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  // ========== MÉTODOS EXISTENTES (mantener sin cambios) ==========

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

  // Verificar email con token desde URL y auto-login
  verifyEmailByToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/verify?token=${token}`).pipe(
      tap(response => {
        console.log('Respuesta de verificación:', response);

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

  // ========== NUEVOS MÉTODOS PARA GOOGLE AUTH ==========

  // Validar token de Google para login
  googleLogin(googleToken: string): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/google/login`, {
      googleToken: googleToken
    }).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuarioLogueado', JSON.stringify({
            idUsuario: response.usuario.idUsuario,
            email: response.usuario.email,
            nombreCompleto: response.usuario.nombreCompleto
          }));
          console.log('Usuario logueado con Google exitosamente');
        }
      })
    );
  }

  // Registrar usuario con Google
  googleRegister(googleToken: string, additionalData?: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/google/register`, {
      googleToken: googleToken,
      ...additionalData
    }).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuarioLogueado', JSON.stringify({
            idUsuario: response.usuario.idUsuario,
            email: response.usuario.email,
            nombreCompleto: response.usuario.nombreCompleto
          }));
          console.log('Usuario registrado con Google exitosamente');
        }
      })
    );
  }

  // ========== MÉTODOS DE UTILIDAD (mantener sin cambios) ==========

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
