import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
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

          // Redirige al dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error de login:', err);
          alert('Usuario o contraseña inválidos');
        }
      });
    }
  }

}
