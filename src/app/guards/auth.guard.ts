import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    return this.checkLogin();
  }

  canActivateChild(): boolean {
    return this.checkLogin();
  }

  private checkLogin(): boolean {
    const logged = this.authService.isLoggedIn();
    console.log('Verificando login: ', logged);

    if (logged) return true;

    this.router.navigate(['/login']);
    return false;
  }

}
