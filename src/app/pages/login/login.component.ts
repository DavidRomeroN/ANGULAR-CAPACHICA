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
  private returnUrl: string = '/capachica';

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
      console.log('🔀 Usuario ya logueado, redirigiendo...');
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Verificar si hay un error de OAuth2 en los parámetros
    const error = this.route.snapshot.queryParams['error'];
    if (error) {
      this.errorMessage = decodeURIComponent(error);
    }

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      clave: ['', Validators.required]
    });

    // Inicializar Google Auth
    this.initializeGoogleAuth();
  }

  ngAfterViewInit(): void {
    // Renderizar botón de Google después de que se cargue la vista
    setTimeout(() => {
      this.renderGoogleButton();
    }, 1000);
  }

  // Inicializar Google Auth
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

  // Configurar Google Auth
  private setupGoogleAuth(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '513028086734-lc187t5b3e67buvqrhi6mq8tnm9odrol.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCallback(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      this.googleInitialized = true;
      console.log('Google Auth inicializado correctamente');
    }
  }

  // Renderizar botón de Google
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

  // Manejar respuesta de Google - USAR BACKEND
  private async handleGoogleCallback(response: any): Promise<void> {
    this.googleLoading = true;
    this.errorMessage = '';

    try {
      console.log('Google callback response recibido, redirigiendo al backend...');

      // Guardar returnUrl para después del callback
      sessionStorage.setItem('oauth2_return_url', this.returnUrl);

      // Redirigir al backend
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    } catch (error) {
      console.error('Error en callback de Google:', error);
      this.errorMessage = 'Error al procesar los datos de Google. Intenta nuevamente.';
      this.googleLoading = false;
    }
  }

  // Método para iniciar login con Google usando el backend
  signInWithGoogle(): void {
    if (!this.googleInitialized) {
      this.errorMessage = 'Google Auth no está inicializado. Intenta recargar la página.';
      return;
    }

    this.googleLoading = true;
    this.errorMessage = '';

    try {
      console.log('Iniciando login con Google a través del backend...');

      // Guardar returnUrl para después del callback
      sessionStorage.setItem('oauth2_return_url', this.returnUrl);

      // Redirigir al backend
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    } catch (error) {
      console.error('Error al iniciar Google Auth:', error);
      this.errorMessage = 'Error al conectar con Google. Intenta nuevamente.';
      this.googleLoading = false;
    }
  }

  // Login tradicional
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('✅ Login tradicional exitoso');
          console.log('🎯 Redirigiendo a:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        },
        error: (err) => {
          console.error('Error de login:', err);
          this.isLoading = false;

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

  // Limpiar mensaje de error
  clearError(): void {
    this.errorMessage = '';
  }

  // Ir a registro
  goToRegister(): void {
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }
}
