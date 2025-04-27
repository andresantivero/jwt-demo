import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated = this.isAuthenticatedSubject.asObservable();
  private tokenKey = 'jwt_token';

  constructor() {
  // Comprobar si hay un token al iniciar la aplicación
    this.checkToken();
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse | null> {

  // Simulación de la verificación de credenciales en el servidor
    if (credentials.username === 'demo' && credentials.password === 'password') {

      // Simulación de la generación del JWT
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      this.setToken(token);
      this.isAuthenticatedSubject.next(true);
      return of({ token }).pipe(delay(1000)); // Simular una llamada asíncrona

    } else {

      return of(null).pipe(delay(1000)); // Simular fallo de autenticación

    }
  }
  logout(): void {

    this.removeToken();
    this.isAuthenticatedSubject.next(false);

  }
  getToken(): string | null {

    return localStorage.getItem(this.tokenKey);

  }

  private setToken(token: string): void {

    localStorage.setItem(this.tokenKey, token);

  }

  private removeToken(): void {

    localStorage.removeItem(this.tokenKey);

  }
  
  private checkToken(): void {

    const token = this.getToken(); this.isAuthenticatedSubject.next(!!token);

  }

}