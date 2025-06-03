import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BiometricGuard implements CanActivate {
  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async canActivate(): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Simulación de huella',
      message: 'Por favor, coloque su huella para continuar.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => false
        },
        {
          text: 'Aceptar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Aguarde un momento, accediendo...',
              duration: 1500,
              spinner: 'crescent'
            });
            await loading.present();
            await loading.onDidDismiss();
            // Simula acceso concedido
            return true;
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    // Si el usuario no cancela, permite el acceso
    return role !== 'cancel';
  }
}