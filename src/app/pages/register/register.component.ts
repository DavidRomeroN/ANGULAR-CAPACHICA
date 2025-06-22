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

  // Estados del componente
  showRegistrationForm: boolean = true;
  showSuccessMessage: boolean = false;

  // Variables de control
  private returnUrl: string = '/capachica';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  registeredEmail: string = '';

  // Variables para Google Auth
  googleLoading: boolean = false;
  googleInitialized: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capturar el returnUrl
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/capachica';

    // Verificar si el usuario ya está logueado
    if (this.isUserLoggedIn()) {
      console.log('🔀 Usuario ya logueado, redirigiendo...');
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Verificar si viene de verificación exitosa
    this.checkVerificationSuccess();

    // Verificar si hay un error de OAuth2 en los parámetros
    const error = this.route.snapshot.queryParams['error'];
    if (error) {
      this.errorMessage = decodeURIComponent(error);
    }

    // Configurar el formulario
    this.setupForm();

    // Inicializar Google Auth
    this.initializeGoogleAuth();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderGoogleButton();
    }, 1000);
  }

  // Inicializar Google Auth
  private async initializeGoogleAuth(): Promise<void> {
    try {
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

  // Manejar respuesta de Google
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

  // Método para iniciar registro con Google
  signUpWithGoogle(): void {
    if (!this.googleInitialized) {
      this.errorMessage = 'Google Auth no está inicializado. Intenta recargar la página.';
      return;
    }

    this.googleLoading = true;
    this.errorMessage = '';

    try {
      console.log('Iniciando registro con Google a través del backend...');

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

  // ========== MÉTODOS EXISTENTES ==========

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

  // Usar AuthService mejorado
  private isUserLoggedIn(): boolean {
    const result = this.authService.isLoggedIn();
    console.log('🔍 isUserLoggedIn() resultado:', result);
    return result;
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
