import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, onSnapshot,addDoc } from 'firebase/firestore';

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
const db = getFirestore(firebaseApp);

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

  getCurrentUser() {
    return auth.currentUser;
  }

  async getUserData() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  }

  getUserTransactionsRealtime(callback: (transacciones: any[]) => void) {
    const user = this.getCurrentUser();
    if (!user) return;

    const transaccionesRef = collection(db, 'usuarios', user.uid, 'Transacciones');

    // Esto escucha en tiempo real
    return onSnapshot(transaccionesRef, (snapshot) => {
      const transacciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transacciones);
    });
  }


  register(userData: { name: string; email: string; password: string }): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(auth, userData.email, userData.password)).pipe(
      switchMap((userCredential) => {
        // Actualizar el nombre del usuario
        return from(updateProfile(userCredential.user, {
          displayName: userData.name
        })).pipe(
          switchMap(() => {
            // Crear documento del usuario en Firestore
            const userDocRef = doc(db, 'usuarios', userCredential.user.uid);
            return from(setDoc(userDocRef, {
              user_name: userData.name,
              user_mail: userData.email,
              user_pass: userData.password, // Nota: normalmente no se almacena la contraseña en texto plano
              user_pesos: 0,
              user_dolares: 0
            }));
          }),
          map(() => userCredential)
        );
      }),
      catchError(error => {
        console.error('Registration error', error);
        throw error;
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(auth, email)).pipe(
      catchError(error => {
        console.error('Password reset error', error);
        throw error;
      })
    );
  }

 

depositar(monto: number, tipo: number): Observable<void> {
  const user = this.getCurrentUser();
  if (!user) return throwError(() => new Error('Usuario no autenticado'));

  const userDocRef = doc(db, 'usuarios', user.uid);
  const transaccionesRef = collection(db, 'usuarios', user.uid, 'Transacciones');

  return from(getDoc(userDocRef)).pipe(
    switchMap((docSnap) => {
      if (!docSnap.exists()) throw new Error('Usuario no encontrado');
      const userData = docSnap.data();

      console.log("Datos actuales del usuario:", userData);

      let nuevosPesos = userData['user_pesos'] || 0;
      let nuevosDolares = userData['user_dolares'] || 0;

      if (tipo === 1) {
        nuevosPesos += monto;
      } else if (tipo === 3) {
        nuevosDolares += monto;
      } else {
        throw new Error('Tipo de transacción inválido');
      }

      console.log("Nuevos valores -> Pesos:", nuevosPesos, "Dólares:", nuevosDolares);

      return from(setDoc(userDocRef, {
        ...userData,
        user_pesos: nuevosPesos,
        user_dolares: nuevosDolares
      })).pipe(
        switchMap(() => {
          const transaccion = {
            transacciones_dolar: tipo === 3 ? monto : 0,
            transacciones_peso: tipo === 1 ? monto : 0,
            transacciones_tipo: tipo,
            transacciones_fecha: new Date().toISOString()
          };
          console.log("Transacción a registrar:", transaccion);
          return from(addDoc(transaccionesRef, transaccion));
        })
      );
    }),
    map(() => { }),
    catchError(error => {
      console.error('🔥 ERROR DETECTADO 🔥', error);
      return throwError(() => new Error('Ocurrió un error al procesar el depósito.'));
    })
  );
}



}
