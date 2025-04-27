import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, map, tap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      take(1),
      tap(async (isAuthenticated) => {
        if (!isAuthenticated) {
          const toast = await this.toastController.create({
            message: 'No estás logueado. Redirigiendo al login...',
            duration: 1500, // 1.5 segundos
            color: 'warning',
            position: 'middle',
			
          });
          await toast.present();
          
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1500); // 👈 le damos tiempo para que termine el Toast
        }
      }),
      map(isAuthenticated => isAuthenticated)
    );
  }
}
