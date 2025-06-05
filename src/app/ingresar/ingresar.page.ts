import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

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
  esperandoConfirmacion: boolean = false;

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.authService.getToken();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  async prepararDeposito() {
    if (!this.monto || this.monto <= 0) {
      this.mostrarAlerta('⚠️ Monto inválido', 'Ingrese un monto mayor a 0.');
      return;
    }

    const transaccion = {
      tipo: this.tipoSeleccionado,
      monto: this.monto,
      fecha: new Date().toISOString()
    };

    localStorage.setItem('transaccionPendiente', JSON.stringify(transaccion));
    this.esperandoConfirmacion = true;
    this.mostrarAlerta('🕒 Esperando Confirmación', 'Cuando hayas realizado la transferencia, confirmá el depósito.');
  }

  async confirmarDeposito() {
    const transaccionGuardada = localStorage.getItem('transaccionPendiente');

    if (!transaccionGuardada) {
      this.mostrarAlerta('❌ Error', 'No hay transacción pendiente para confirmar.');
      return;
    }

    const transaccion = JSON.parse(transaccionGuardada);
    const loading = await this.loadingCtrl.create({
      message: 'Confirmando depósito...',
      spinner: 'dots'
    });
     
    await loading.present();

    this.authService.depositar(transaccion.monto, transaccion.tipo).subscribe({
      next: async () => {
        
        await loading.dismiss();
        localStorage.removeItem('transaccionPendiente');
        this.mostrarAlerta('✅ Éxito', `Se depositaron ${transaccion.monto} ${transaccion.tipo === 1 ? 'pesos' : 'dólares'} correctamente.`);
        this.resetFormulario();
      },
      error: async () => {
        await loading.dismiss();
        this.mostrarAlerta('❌ Error', 'Ocurrió un problema al confirmar el depósito.');
      }
    });
  }

  cancelarDeposito() {
    localStorage.removeItem('transaccionPendiente');
    this.mostrarAlerta('🚫 Cancelado', 'La operación fue cancelada.');
    this.resetFormulario();
  }

  resetFormulario() {
    this.monto = 0;
    this.tipoSeleccionado = 1;
    this.esperandoConfirmacion = false;
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
