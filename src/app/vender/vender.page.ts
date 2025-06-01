import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DolarService } from '../auth/dolar.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-vender',
  templateUrl: './vender.page.html',
  styleUrls: ['./vender.page.scss'],
  standalone: false
})
export class VenderPage implements OnInit {

  dolarData: any[] = [];
  precioVenta: number = 0;
  userDolares: number = 0;

  dolaresAVender: number = 0;
  maxDolares: number = 0;

  loading = true;
  errorMessage = '';
  botonDisabled = true;

  constructor(
    private dolarService: DolarService,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.cargarPerfil();
    this.cargarCotizaciones();
  }

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      const data = await this.authService.getUserData();
      this.userDolares = data?.['user_dolares'] ?? 0;
      if (this.precioVenta > 0) {
        this.maxDolares = this.userDolares;
        this.validarVenta();
      }
    } catch (error) {
      console.error('Error cargando perfil', error);
      this.userDolares = 0;
    }
  }

  cargarCotizaciones() {
    this.dolarService.llamarApiDolar().subscribe({
      next: (data) => {
        this.dolarData = data || [];
        this.seleccionarPrecioMasCaro();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando cotizaciones:', error);
        this.errorMessage = 'Error cargando cotizaciones';
        this.loading = false;
      }
    });
  }

  seleccionarPrecioMasCaro() {
    const cotizacionesValidas = this.dolarData.filter(d => !d.nombre.toLowerCase().includes('tarjeta'));
    if (!cotizacionesValidas.length) {
      this.errorMessage = 'No se encontraron cotizaciones válidas.';
      return;
    }
    this.precioVenta = Math.max(...cotizacionesValidas.map(c => c.venta));
    this.maxDolares = this.userDolares;
    this.validarVenta();
  }

  validarVenta() {
    if (this.dolaresAVender <= 0) {
      this.errorMessage = 'Ingrese una cantidad mayor que cero.';
      this.botonDisabled = true;
      return;
    }
    if (this.dolaresAVender > this.maxDolares) {
      this.errorMessage = `No tienes suficientes dólares. Máximo permitido: ${this.maxDolares} dólares.`;
      this.botonDisabled = true;
      return;
    }
    this.errorMessage = '';
    this.botonDisabled = false;
  }

  vender() {
    if (this.botonDisabled) return;

    this.authService.venderDolares(this.dolaresAVender, this.precioVenta).subscribe({
      next: async () => {
        await this.mostrarConfirmacionVenta(this.dolaresAVender, this.precioVenta);
        this.userDolares -= this.dolaresAVender;
        this.maxDolares = this.userDolares;
        this.dolaresAVender = 0;
        this.botonDisabled = true;
      },
      error: async (e) => {
        console.error('Error en la venta', e);
        await this.mostrarError('Error procesando la venta');
      }
    });
  }

  async mostrarConfirmacionVenta(cantidadDolares: number, precio: number) {
    const alert = await this.alertCtrl.create({
      header: 'Venta exitosa',
      message: `Vendiste ${cantidadDolares} dólares a $${precio} por dólar.`,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}
