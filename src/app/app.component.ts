import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GranTurismo';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Debug temporal para verificar el estado de autenticación
    this.debugAuthState();

    // Verificar cambios en localStorage (útil para debug)
    window.addEventListener('storage', () => {
      console.log('📦 localStorage cambió, verificando auth...');
      this.debugAuthState();
    });

    // También verificar cada 5 segundos (temporal para debug)
    setInterval(() => {
      const currentState = this.authService.isLoggedInQuiet();
      if (currentState !== this.lastKnownState) {
        console.log('🔄 Estado de auth cambió:', currentState);
        this.lastKnownState = currentState;
        this.debugAuthState();
      }
    }, 5000);
  }

  private lastKnownState: boolean = false;

  private debugAuthState(): void {
    console.log('=== DEBUG APP COMPONENT ===');
    console.log('🔍 isLoggedIn():', this.authService.isLoggedIn());
    console.log('👤 getLoggedUser():', this.authService.getLoggedUser());
    console.log('🔑 hasToken:', !!this.authService.getToken());
    console.log('⏰ isTokenExpired():', this.authService.isTokenExpired());
    console.log('📍 Current URL:', window.location.href);
    console.log('========================');
  }

  // Método helper para otros componentes (opcional)
  public isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Método para logout desde cualquier parte de la app (opcional)
  public logout(): void {
    this.authService.logout();
    console.log('🚪 Logout desde AppComponent');
  }
}
