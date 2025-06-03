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
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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
      switchMap((userCredential) => {
        return from(userCredential.user.getIdToken()).pipe(
          map((token) => {
            this.setToken(token);
            this.isAuthenticatedSubject.next(true);
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

        let nuevosPesos = userData['user_pesos'] || 0;
        let nuevosDolares = userData['user_dolares'] || 0;

        if (tipo === 1) {
          nuevosPesos += monto;
        } else if (tipo === 3) {
          nuevosDolares += monto;
        } else {
          throw new Error('Tipo de transacción inválido');
        }

        return from(setDoc(userDocRef, {
          ...userData,
          user_pesos: nuevosPesos,
          user_dolares: nuevosDolares
        })).pipe(
          switchMap(() => {
            const transaccion = {
              transaccion_dolar: tipo === 3 ? monto : 0,
              transaccion_peso: tipo === 1 ? monto : 0,
              transaccion_tipo: tipo,
              transaccion_fecha: new Date()
            };
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

  comprarDolares(montoPesos: number, precioDolar: number): Observable<void> {
    const dolaresAComprar = +(montoPesos / precioDolar).toFixed(2);

    if (montoPesos <= 0 || dolaresAComprar <= 0) {
      return throwError(() => new Error('Monto o dólares inválidos para comprar'));
    }

    const user = this.getCurrentUser();
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const userDocRef = doc(db, 'usuarios', user.uid);
    const transaccionesRef = collection(db, 'usuarios', user.uid, 'Transacciones');

    return from(getDoc(userDocRef)).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists()) throw new Error('Usuario no encontrado');
        const userData = docSnap.data();

        const nuevosPesos = (userData['user_pesos'] || 0) - montoPesos;
        const nuevosDolares = (userData['user_dolares'] || 0) + dolaresAComprar;

        if (nuevosPesos < 0) throw new Error('Saldo en pesos insuficiente');

        return from(setDoc(userDocRef, {
          ...userData,
          user_pesos: nuevosPesos,
          user_dolares: nuevosDolares
        })).pipe(
          switchMap(() => {
            const transaccion = {
              transaccion_dolar: dolaresAComprar,
              transaccion_peso: montoPesos,
              transaccion_tipo: 5,
              transaccion_fecha: new Date()
            };
            return from(addDoc(transaccionesRef, transaccion));
          })
        );
      }),
      map(() => { }),
      catchError(error => {
        console.error('🔥 ERROR COMPRA 🔥', error);
        return throwError(() => new Error('Ocurrió un error al procesar la compra de dólares.'));
      })
    );
  }

  venderDolares(montoDolares: number, precioDolar: number): Observable<void> {
    const montoPesos = +(montoDolares * precioDolar).toFixed(2);

    if (montoDolares <= 0 || montoPesos <= 0) {
      return throwError(() => new Error('Monto inválido para vender'));
    }

    const user = this.getCurrentUser();
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const userDocRef = doc(db, 'usuarios', user.uid);
    const transaccionesRef = collection(db, 'usuarios', user.uid, 'Transacciones');

    return from(getDoc(userDocRef)).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists()) throw new Error('Usuario no encontrado');
        const userData = docSnap.data();

        const nuevosDolares = (userData['user_dolares'] || 0) - montoDolares;
        const nuevosPesos = (userData['user_pesos'] || 0) + montoPesos;

        if (nuevosDolares < 0) throw new Error('Saldo en dólares insuficiente');

        return from(setDoc(userDocRef, {
          ...userData,
          user_pesos: nuevosPesos,
          user_dolares: nuevosDolares
        })).pipe(
          switchMap(() => {
            const transaccion = {
              transaccion_dolar: montoDolares,
              transaccion_peso: montoPesos,
              transaccion_tipo: 6,
              transaccion_fecha: new Date()
            };
            return from(addDoc(transaccionesRef, transaccion));
          })
        );
      }),
      map(() => { }),
      catchError(error => {
        console.error('🔥 ERROR VENTA 🔥', error);
        return throwError(() => new Error('Ocurrió un error al procesar la venta de dólares.'));
      })
    );
  }

  retirar(monto: number, tipo: number, aliasOCbu: string): Observable<void> {
    const user = this.getCurrentUser();
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const userDocRef = doc(db, 'usuarios', user.uid);
    const transaccionesRef = collection(db, 'usuarios', user.uid, 'Transacciones');

    return from(getDoc(userDocRef)).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists()) throw new Error('Usuario no encontrado');
        const userData = docSnap.data();

        let saldoPesos = userData['user_pesos'] || 0;
        let saldoDolares = userData['user_dolares'] || 0;

        if (tipo === 2 && monto > saldoPesos) {
          throw new Error('Saldo insuficiente en pesos');
        }

        if (tipo === 4 && monto > saldoDolares) {
          throw new Error('Saldo insuficiente en dólares');
        }

        if (tipo === 2) {
          saldoPesos -= monto;
        } else if (tipo === 4) {
          saldoDolares -= monto;
        } else {
          throw new Error('Tipo de transacción inválido');
        }

        return from(setDoc(userDocRef, {
          ...userData,
          user_pesos: saldoPesos,
          user_dolares: saldoDolares
        })).pipe(
          switchMap(() => {
            const transaccion = {
              transaccion_dolar: tipo === 4 ? -monto : 0,
              transaccion_peso: tipo === 2 ? -monto : 0,
              transaccion_tipo: tipo,
              transaccion_fecha: new Date(),
              transaccion_destino: aliasOCbu || ''
            };
            return from(addDoc(transaccionesRef, transaccion));
          })
        );
      }),
      map(() => { }),
      catchError(error => {
        console.error('❌ Error en retiro:', error);
        return throwError(() => new Error(error.message || 'Error al procesar el retiro'));
      })
    );
  }

  // --- NUEVO: Guardar foto de perfil del usuario en Storage y Firestore ---
  async actualizarFotoUsuario(base64Foto: string) {
    const user = this.getCurrentUser();
    if (!user) return;

    const storage = getStorage();
    const storageRef = ref(storage, `usuarios/${user.uid}/perfil.jpg`);
    await uploadString(storageRef, base64Foto, 'data_url');
    const url = await getDownloadURL(storageRef);

    const userDocRef = doc(db, 'usuarios', user.uid);
    await setDoc(userDocRef, { user_foto: url }, { merge: true });
  }
}