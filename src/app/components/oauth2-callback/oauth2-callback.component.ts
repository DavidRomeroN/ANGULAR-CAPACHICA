import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta según tu estructura
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true, // ¡IMPORTANTE! Debe ser standalone
  imports: [CommonModule], // Importar módulos necesarios
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="background-color: #000000;">
      <div class="text-center text-white">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h4>{{ statusMessage }}</h4>
        <p class="text-muted">{{ detailMessage }}</p>

        <!-- Debug info (temporal) -->
        <div class="mt-4 p-3" style="background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.8rem;" *ngIf="showDebug">
          <strong>Debug Info:</strong><br>
          <small>Token: {{ debugInfo.hasToken ? 'Recibido' : 'No recibido' }}</small><br>
          <small>Email: {{ debugInfo.email || 'No recibido' }}</small><br>
          <small>Error: {{ debugInfo.error || 'Ninguno' }}</small>
        </div>
      </div>
    </div>
  `
})
export class OAuth2CallbackComponent implements OnInit {
  statusMessage: string = 'Procesando autenticación...';
  detailMessage: string = 'Verificando credenciales de Google...';
  showDebug: boolean = true; // Cambiar a false en producción

  debugInfo = {
    hasToken: false,
    email: '',
    error: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🎯 OAuth2CallbackComponent iniciado');
    console.log('📍 URL actual:', window.location.href);
    this.handleCallback();
  }

  private handleCallback(): void {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];
      const error = params['message'];

      // Actualizar debug info
      this.debugInfo = {
        hasToken: !!token,
        email: email || '',
        error: error || ''
      };

      console.log('🔍 OAuth2 Callback params:', {
        hasToken: !!token,
        email: email,
        error: error,
        fullParams: params
      });

      if (error) {
        this.handleError(decodeURIComponent(error));
      } else if (token && email) {
        this.handleSuccess(token, decodeURIComponent(email));
      } else {
        console.error('❌ Faltan parámetros:', { token: !!token, email: !!email });
        this.handleError('Datos de autenticación incompletos');
      }
    });
  }

  private handleSuccess(token: string, email: string): void {
    this.statusMessage = 'Autenticación exitosa';
    this.detailMessage = `Bienvenido, ${email}`;

    console.log('✅ Procesando OAuth2 exitoso...');
    console.log('📧 Email:', email);
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    // Usar el AuthService para manejar el callback
    try {
      this.authService.handleOAuth2Callback(token, email);

      // Verificar que el usuario quedó logueado
      setTimeout(() => {
        const isLoggedIn = this.authService.isLoggedIn();
        console.log('🔍 Estado después de OAuth2:', isLoggedIn);

        if (isLoggedIn) {
          this.statusMessage = 'Redirigiendo...';
          this.detailMessage = 'Te llevamos a la página principal';

          // Obtener returnUrl si existe
          const returnUrl = sessionStorage.getItem('oauth2_return_url') || '/capachica';
          sessionStorage.removeItem('oauth2_return_url'); // Limpiar

          console.log('🎯 Redirigiendo a:', returnUrl);

          // Redirigir después de un breve delay
          setTimeout(() => {
            this.router.navigate([returnUrl]);
          }, 1500);
        } else {
          console.error('❌ Usuario no quedó autenticado después de handleOAuth2Callback');
          this.handleError('Error interno: Usuario no quedó autenticado');
        }
      }, 500); // Pequeño delay para que se procesen los datos

    } catch (error) {
      console.error('❌ Error en handleOAuth2Callback:', error);
      this.handleError('Error procesando la autenticación');
    }
  }

  private handleError(errorMessage: string): void {
    this.statusMessage = 'Error en la autenticación';
    this.detailMessage = errorMessage;

    console.error('❌ Error en OAuth2 callback:', errorMessage);

    // Redirigir al login después de mostrar el error
    setTimeout(() => {
      this.router.navigate(['/login'], {
        queryParams: { error: errorMessage }
      });
    }, 4000); // Más tiempo para leer el error
  }
}
