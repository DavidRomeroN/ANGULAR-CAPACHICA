import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      user: ['', Validators.required],
      clave: ['', Validators.required],
      rol: ['USER', Validators.required],
      estado: ['ACTIVO', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          alert('Usuario registrado exitosamente');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error de registro:', err);
          alert('El usuario ya existe o hubo un problema');
        }
      });
    }
  }
}
