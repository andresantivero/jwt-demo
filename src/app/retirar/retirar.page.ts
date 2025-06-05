import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-retirar',
  templateUrl: './retirar.page.html',
  styleUrls: ['./retirar.page.scss'],
  standalone: false
})
export class RetirarPage implements OnInit {
  monto: number = 0;
  tipo: 'pesos' | 'dolares' = 'pesos';
  aliasOCbu: string = '';

  saldoPesos: number = 0;
  saldoDolares: number = 0;

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.obtenerSaldo();
  }

logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

 async obtenerSaldo() {
  try {
    const data = await this.authService.getUserData();
    this.saldoPesos = data?.['user_pesos'] ?? 0;
    this.saldoDolares = data?.['user_dolares'] ?? 0;
  } catch (error) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'No se pudo cargar tu saldo.',
      buttons: ['OK']
    });
    await alert.present();
  }
}

  async realizarRetiro() {
    const tipoTransaccion = this.tipo === 'pesos' ? 2 : 4;

    if (!this.monto || this.monto <= 0 || !this.aliasOCbu) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Completá todos los campos correctamente.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Validar saldo suficiente
    if (this.tipo === 'pesos' && this.monto > this.saldoPesos) {
      const alert = await this.alertController.create({
        header: 'Fondos insuficientes',
        message: 'No tenés suficiente saldo en pesos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.tipo === 'dolares' && this.monto > this.saldoDolares) {
      const alert = await this.alertController.create({
        header: 'Fondos insuficientes',
        message: 'No tenés suficiente saldo en dólares.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Conectando con cuenta destino...',
      spinner: 'dots'
    });

    await loading.present();

    this.authService.retirar(this.monto, tipoTransaccion, this.aliasOCbu).subscribe({
      next: async () => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: `Retiro de ${this.monto} ${this.tipo} realizado correctamente.`,
          buttons: ['OK']
        });
        await alert.present();
        this.monto = 0;
        this.aliasOCbu = '';
        this.obtenerSaldo(); // actualiza saldos después del retiro
      },
      error: async (err) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: err.message || 'No se pudo realizar el retiro.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
