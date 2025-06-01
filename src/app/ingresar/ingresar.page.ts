import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.page.html',
  styleUrls: ['./ingresar.page.scss'],
  standalone: false
})
export class IngresarPage implements OnInit {

  token: string | null = null;
  tipoSeleccionado: number = 1;
  monto: number = 0;

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.token = this.authService.getToken();
  }

  async depositarDinero() {
    if (!this.monto || this.monto <= 0) {
      this.mostrarAlerta('Monto inválido', 'Ingrese un monto mayor a 0.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Procesando depósito...',
      spinner: 'circles',
      duration: 5000
    });
    await loading.present();

    this.authService.depositar(this.monto, this.tipoSeleccionado).subscribe({
      next: async () => {
        await loading.dismiss();
        this.mostrarAlerta('Éxito', `Se depositaron ${this.monto} ${this.tipoSeleccionado === 1 ? 'pesos' : 'dólares'} correctamente.`);
        this.monto = 0;
      },
      error: async (err) => {
        await loading.dismiss();
        this.mostrarAlerta('Error', 'Ocurrió un error al procesar el depósito.');
      }
    });
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
