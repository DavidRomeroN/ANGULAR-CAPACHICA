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

  // ========== MÉTODOS DE UTILIDAD ACTUALIZADOS ==========

  // ACTUALIZADO: Verificar si el usuario está logueado (con debug)
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuarioLogueado');

    // Debug para ver qué está pasando
    console.log('🔍 AuthService.isLoggedIn() verificando:', {
      hasToken: !!token,
      hasUser: !!usuario,
      tokenStart: token ? token.substring(0, 20) + '...' : 'null',
      userEmail: usuario ? JSON.parse(usuario).email : 'null'
    });

    const isLoggedIn = !!(token && usuario);
    console.log('✅ Resultado isLoggedIn():', isLoggedIn);

    return isLoggedIn;
  }

  // NUEVO: Verificar si el usuario está logueado (sin debug, para producción)
  isLoggedInQuiet(): boolean {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuarioLogueado');
    return !!(token && usuario);
  }

  // ACTUALIZADO: Logout con debug
  logout(): void {
    console.log('🚪 AuthService.logout() - Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogueado');
    console.log('🧹 localStorage limpiado');
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ACTUALIZADO: Obtener usuario logueado con debug
  getLoggedUser(): any {
    const usuario = localStorage.getItem('usuarioLogueado');
    const parsedUser = usuario ? JSON.parse(usuario) : null;

    console.log('👤 AuthService.getLoggedUser():', parsedUser);
    return parsedUser;
  }

  // NUEVO: Método para manejar callback de OAuth2
  handleOAuth2Callback(token: string, email: string): void {
    console.log('🔄 AuthService.handleOAuth2Callback()');
    console.log('📧 Email:', email);
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    // Guardar token
    localStorage.setItem('token', token);

    // Guardar usuario (estructura consistente con login normal)
    const userData = {
      email: email,
      loginMethod: 'google',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('usuarioLogueado', JSON.stringify(userData));

    console.log('💾 Datos OAuth2 guardados correctamente');
    console.log('🔍 Verificación post-guardado:', this.isLoggedIn());
  }

  // NUEVO: Método para verificar si el token está expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeJwtPayload(token);
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        console.log('⏰ Token expirado, limpiando sesión...');
        this.logout();
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error al verificar expiración del token:', error);
      return true;
    }
  }

  // NUEVO: Decodificar payload del JWT
  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Error al decodificar token JWT');
    }
  }

  // Verificar si el token es válido
  validateToken(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/validate-token`);
  }
}
