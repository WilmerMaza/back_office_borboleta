import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  canActivate(): Observable<boolean> {
    // Verificar si hay token y si es válido
    if (!this.authService.isAuthenticated() || !this.authService.isTokenValid()) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    // Verificar si el token está en el estado NGXS
    const token = this.store.selectSnapshot(state => state.auth.access_token);
    if (!token) {
      this.store.dispatch({ type: 'INIT_AUTH' });
    }

    return of(true);
  }
}
