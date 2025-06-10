import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router'; // ← Agregar ActivatedRoute

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private returnUrl: string = '/dashboard'; // ← URL por defecto

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // ← Agregar esto
  ) {}

  ngOnInit(): void {
    // ← Capturar el returnUrl ANTES de verificar si está logueado
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]); // ← Usar returnUrl en lugar de '/dashboard'
    }

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      clave: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Guarda el token
          localStorage.setItem('token', response.token);

          // ✅ Guarda también los datos del usuario logueado
          localStorage.setItem('usuarioLogueado', JSON.stringify({
            idUsuario: response.idUsuario,
            email: response.email
          }));

          // ← Redirige al returnUrl en lugar de '/dashboard'
          console.log('Redirigiendo a:', this.returnUrl); // Para debug
          this.router.navigate([this.returnUrl]);
        },
        error: (err) => {
          console.error('Error de login:', err);
          alert('Usuario o contraseña inválidos');
        }
      });
    }
  }
}
