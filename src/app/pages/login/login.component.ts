import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  private returnUrl: string = '/capachica'; // Cambiar de '/dashboard' a '/capachica'

  // NUEVAS propiedades para Google Auth
  googleLoading: boolean = false;
  googleInitialized: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capturar el returnUrl ANTES de verificar si está logueado
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/capachica';

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      clave: ['', Validators.required]
    });

    // NUEVO: Inicializar Google Auth
    this.initializeGoogleAuth();
  }

  ngAfterViewInit(): void {
    // NUEVO: Renderizar botón de Google después de que se cargue la vista
    setTimeout(() => {
      this.renderGoogleButton();
    }, 1000);
  }

  // NUEVO: Inicializar Google Auth
  private async initializeGoogleAuth(): Promise<void> {
    try {
      // Cargar script de Google si no existe
      if (!document.getElementById('google-identity-script')) {
        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.setupGoogleAuth();
        };

        document.head.appendChild(script);
      } else {
        this.setupGoogleAuth();
      }
    } catch (error) {
      console.error('Error al inicializar Google Auth:', error);
    }
  }

  // NUEVO: Configurar Google Auth
  private setupGoogleAuth(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '513028086734-lc187t5b3e67buvqrhi6mq8tnm9odrol.apps.googleusercontent.com', // Client ID de ejemplo
        callback: (response: any) => this.handleGoogleCallback(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      this.googleInitialized = true;
      console.log('Google Auth inicializado correctamente');
    }
  }

  // NUEVO: Renderizar botón de Google
  private renderGoogleButton(): void {
    if (this.googleInitialized && typeof google !== 'undefined') {
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '280px'
        });
      }
    }
  }

  // NUEVO: Manejar respuesta de Google - SOLO FRONTEND (SIN BACKEND)
  private async handleGoogleCallback(response: any): Promise<void> {
    this.googleLoading = true;
    this.errorMessage = '';

    try {
      console.log('Google callback response:', response);

      // DECODIFICAR directamente el JWT token de Google
      const userData = this.decodeGoogleJWT(response.credential);

      if (userData && userData.email) {
        // Simular login exitoso - guardar datos en localStorage
        localStorage.setItem('usuarioLogueado', JSON.stringify({
          idUsuario: Date.now(), // ID temporal basado en timestamp
          email: userData.email,
          nombreCompleto: userData.name || userData.email.split('@')[0]
        }));

        // Simular token JWT
        localStorage.setItem('token', 'google_auth_token_' + Date.now());

        console.log('✅ Login con Google exitoso (solo frontend)');
        console.log('👤 Usuario:', userData.email);
        console.log('🎯 Redirigiendo a:', this.returnUrl);

        alert('✅ Inicio de sesión exitoso con Google');
        this.router.navigate([this.returnUrl]);
      } else {
        throw new Error('No se pudieron obtener los datos del usuario de Google');
      }
    } catch (error) {
      console.error('Error en callback de Google:', error);
      this.errorMessage = 'Error al procesar los datos de Google. Intenta nuevamente.';
    } finally {
      this.googleLoading = false;
    }
  }

  // NUEVO: Decodificar JWT de Google (solo frontend)
  private decodeGoogleJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      console.log('Datos decodificados de Google:', payload);
      return payload;
    } catch (error) {
      console.error('Error al decodificar token de Google:', error);
      return null;
    }
  }

  // NUEVO: Método para iniciar login con Google
  signInWithGoogle(): void {
    if (!this.googleInitialized) {
      this.errorMessage = 'Google Auth no está inicializado. Intenta recargar la página.';
      return;
    }

    this.googleLoading = true;
    this.errorMessage = '';

    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt not displayed');
          this.googleLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Error al conectar con Google. Intenta nuevamente.';
      this.googleLoading = false;
    }
  }

  // MÉTODO EXISTENTE: Login tradicional (mantener la lógica)
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Los datos ya se guardan en el servicio
          console.log('Redirigiendo a:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        },
        error: (err) => {
          console.error('Error de login:', err);
          this.isLoading = false;

          // Mejorar el manejo de errores
          if (err.status === 401) {
            this.errorMessage = 'Email o contraseña incorrectos';
          } else if (err.status === 403) {
            this.errorMessage = 'Cuenta no verificada. Revisa tu email para verificar tu cuenta.';
          } else if (err.status === 0) {
            this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          } else {
            this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
          }
        }
      });
    }
  }

  // NUEVO: Limpiar mensaje de error
  clearError(): void {
    this.errorMessage = '';
  }

  // NUEVO: Ir a registro
  goToRegister(): void {
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }
}
