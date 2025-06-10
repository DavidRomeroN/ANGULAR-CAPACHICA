import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router'; // ← Agregar ActivatedRoute

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  private returnUrl: string = '/dashboard'; // ← URL por defecto

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // ← Agregar esto
  ) {}

  ngOnInit(): void {
    // ← Capturar el returnUrl
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Configurar el formulario
    this.registerForm = this.fb.group({
      user: ['', Validators.required],
      clave: ['', Validators.required],
      rol: ['USER'], // o el valor por defecto que uses
      estado: ['ACTIVO'] // o el valor por defecto que uses
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          // Después del registro exitoso, hacer auto-login
          this.authService.login({
            user: this.registerForm.value.user,
            clave: this.registerForm.value.clave
          }).subscribe({
            next: (loginResponse) => {
              // Guardar token y datos del usuario
              localStorage.setItem('token', loginResponse.token);
              localStorage.setItem('usuarioLogueado', JSON.stringify({
                idUsuario: loginResponse.idUsuario,
                email: loginResponse.email
              }));

              // Redirigir al returnUrl
              console.log('Registro exitoso, redirigiendo a:', this.returnUrl);
              this.router.navigate([this.returnUrl]);
            },
            error: (loginError) => {
              console.error('Error en auto-login:', loginError);
              // Si falla el auto-login, ir al login manual con returnUrl
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: this.returnUrl }
              });
            }
          });
        },
        error: (error) => {
          console.error('Error en registro:', error);
          alert('Error al registrar usuario');
        }
      });
    }
  }
}
