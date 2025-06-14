import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  // Estados del componente
  showRegistrationForm: boolean = true;
  showSuccessMessage: boolean = false;

  // Variables de control
  private returnUrl: string = '/dashboard';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  registeredEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capturar el returnUrl de los query parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Verificar si el usuario ya está logueado
    if (this.isUserLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Verificar si viene de verificación exitosa
    this.checkVerificationSuccess();

    // Configurar el formulario
    this.setupForm();
  }

  private checkVerificationSuccess(): void {
    const verified = this.route.snapshot.queryParams['verified'];
    const email = this.route.snapshot.queryParams['email'];

    if (verified === 'true' && email) {
      this.showRegistrationForm = false;
      this.showSuccessMessage = true;
      this.successMessage = `Email ${email} verificado exitosamente. Ya puedes iniciar sesión.`;

      // Redirigir al login después de 3 segundos
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

  // Validador personalizado para confirmar contraseñas
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('clave');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Método para verificar si el usuario está logueado
  private isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Getters para el formulario
  get email() { return this.registerForm.get('email'); }
  get clave() { return this.registerForm.get('clave'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  // Método principal de registro
  // Método principal de registro - VERSIÓN MEJORADA
  onSubmit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;

    // Preparar datos para el registro
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

        // MANEJO ESPECIAL: Si el status es 200, tratar como éxito
        // Esto resuelve el problema de responseType
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

// Método para manejar registro exitoso - NUEVO
  private handleSuccessfulRegistration(): void {
    this.registeredEmail = this.registerForm.value.email;
    this.showRegistrationForm = false;
    this.showSuccessMessage = true;
    this.successMessage = `¡Registro exitoso! Hemos enviado un email de verificación a ${this.registeredEmail}.
                        Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.`;
    this.isLoading = false;
  }

  // Método para reenviar email de verificación
  // En register.component.ts
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

        // ✅ SOLUCIÓN: Manejar el caso específico de status 200 con error de parsing
        if (error.status === 200) {
          // Aunque Angular lo marque como error, el backend respondió exitosamente
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
      // El backend devuelve el mensaje de error como texto
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

  // Métodos de navegación
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

  // Métodos para limpiar mensajes
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
