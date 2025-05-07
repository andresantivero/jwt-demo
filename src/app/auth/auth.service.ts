import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';

// Configuración de Firebase (la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyDYBCbtqpswByG674l4Xog63sZtLAa01I4",
  authDomain: "dolarito-app.firebaseapp.com",
  databaseURL: "https://dolarito-app-default-rtdb.firebaseio.com",
  projectId: "dolarito-app",
  storageBucket: "dolarito-app.firebasestorage.app",
  messagingSenderId: "450714400774",
  appId: "1:450714400774:web:fd940e2226fdd9b53a6b87",
  measurementId: "G-8GB396GEV4"
};

// Inicializamos Firebase solo una vez
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated = this.isAuthenticatedSubject.asObservable();
  private tokenKey = 'jwt_token';

  constructor() {
    this.checkToken();
  }
  login(credentials: { username: string; password: string }): Observable<UserCredential | null> {
    return from(signInWithEmailAndPassword(auth, credentials.username, credentials.password)).pipe(
      // Convertimos el token a un observable
      switchMap((userCredential) => {
        return from(userCredential.user.getIdToken()).pipe(
          map((token) => {
            this.setToken(token);
            this.isAuthenticatedSubject.next(true); // 👈 ahora esto es sincrónico dentro del flujo
            return userCredential;
          })
        );
      }),
      catchError(error => {
        console.error('Login error', error);
        return of(null);
      })
    );
  }

  logout(): void {
    signOut(auth).then(() => {
      this.removeToken();
      this.isAuthenticatedSubject.next(false);
    }).catch(error => {
      console.error('Logout error', error);
    });
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
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }
}