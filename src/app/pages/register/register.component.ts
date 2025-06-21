import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;

  // Estados del componente (mantener los existentes)
  showRegistrationForm: boolean = true;
  showSuccessMessage: boolean = false;

  // Variables de control (actualizar returnUrl)
  private returnUrl: string = '/capachica'; // Cambiar de /dashboard a /capachica
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  registeredEmail: string = '';

  // NUEVAS variables para Google Auth
  googleLoading: boolean = false;
  googleInitialized: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capturar el returnUrl de los query parameters (actualizado)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/capachica';

    // Verificar si el usuario ya está logueado
    if (this.isUserLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Verificar si viene de verificación exitosa
    this.checkVerificationSuccess();

    // Configurar el formulario
    this.setupForm();

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
      const buttonElement = document.getElementById('google-signup-button');
      if (buttonElement) {
        google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
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
        // Verificar si el usuario ya existe en localStorage (simulación básica)
        const existingUser = localStorage.getItem('usuarioLogueado');
        if (existingUser) {
          const user = JSON.parse(existingUser);
          if (user.email === userData.email) {
            this.errorMessage = 'Ya tienes una cuenta. Ve al login para iniciar sesión.';
            this.googleLoading = false;
            return;
          }
        }

        // Simular registro exitoso - guardar datos en localStorage
        localStorage.setItem('usuarioLogueado', JSON.stringify({
          idUsuario: Date.now(), // ID temporal basado en timestamp
          email: userData.email,
          nombreCompleto: userData.name || userData.email.split('@')[0]
        }));

        // Simular token JWT
        localStorage.setItem('token', 'google_auth_token_' + Date.now());

        console.log('✅ Registro con Google exitoso (solo frontend)');
        console.log('👤 Usuario registrado:', userData.email);
        console.log('🎯 Redirigiendo a:', this.returnUrl);

        alert('✅ Registro exitoso con Google');
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

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar token de Google:', error);
      return null;
    }
  }

  // NUEVO: Método para iniciar registro con Google
  signUpWithGoogle(): void {
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

  // ========== MANTENER TODOS LOS MÉTODOS EXISTENTES SIN CAMBIOS ==========

  private checkVerificationSuccess(): void {
    const verified = this.route.snapshot.queryParams['verified'];
    const email = this.route.snapshot.queryParams['email'];

    if (verified === 'true' && email) {
      this.showRegistrationForm = false;
      this.showSuccessMessage = true;
      this.successMessage = `Email ${email} verificado exitosamente. Ya puedes iniciar sesión.`;

      setTimeout(() => {
        this.router.navigate(['/login'], {
          queryParams: {
            returnUrl: this.returnUrl,
            verified: 'true'
          }
        });
      }, 3000);
    }
  }

  private setupForm(): void {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      clave: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('clave');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get email() { return this.registerForm.get('email'); }
  get clave() { return this.registerForm.get('clave'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;

    const registerData = {
      email: this.registerForm.value.email,
      clave: this.registerForm.value.clave
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.handleSuccessfulRegistration();
      },
      error: (error) => {
        console.error('Error en registro:', error);

        if (error.status === 200) {
          console.log('Registro exitoso (status 200 en error block)');
          this.handleSuccessfulRegistration();
          return;
        }

        this.isLoading = false;
        this.handleRegistrationError(error);
      }
    });
  }

  private handleSuccessfulRegistration(): void {
    this.registeredEmail = this.registerForm.value.email;
    this.showRegistrationForm = false;
    this.showSuccessMessage = true;
    this.successMessage = `¡Registro exitoso! Hemos enviado un email de verificación a ${this.registeredEmail}.
                        Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.`;
    this.isLoading = false;
  }

  resendVerificationEmail(): void {
    if (!this.registeredEmail) {
      this.errorMessage = 'No se encontró el email registrado.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.resendVerificationCode({ email: this.registeredEmail }).subscribe({
      next: (response) => {
        console.log('Email reenviado:', response);
        this.isLoading = false;
        this.successMessage = `Hemos reenviado el email de verificación a ${this.registeredEmail}. Por favor, revisa tu bandeja de entrada.`;
      },
      error: (error) => {
        console.error('Error al reenviar email:', error);

        if (error.status === 200) {
          console.log('Email reenviado exitosamente (error de parsing)');
          this.isLoading = false;
          this.successMessage = `Hemos reenviado el email de verificación a ${this.registeredEmail}. Por favor, revisa tu bandeja de entrada.`;
          return;
        }

        this.isLoading = false;
        this.errorMessage = 'Error al reenviar el email. Intenta nuevamente.';
      }
    });
  }

  private handleRegistrationError(error: any): void {
    if (error.status === 400) {
      this.errorMessage = typeof error.error === 'string' ? error.error : 'El email ya está registrado o los datos son inválidos.';
    } else if (error.status === 422) {
      this.errorMessage = 'Por favor, verifica que todos los campos sean correctos.';
    } else if (error.status === 0) {
      this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      this.errorMessage = 'Error al registrar usuario. Intenta nuevamente.';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }

  goBackToRegistration(): void {
    this.showRegistrationForm = true;
    this.showSuccessMessage = false;
    this.clearMessages();
  }

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
