import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DolarService } from '../auth/dolar.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comprar',
  templateUrl: './comprar.page.html',
  styleUrls: ['./comprar.page.scss'],
  standalone: false
})
export class ComprarPage implements OnInit {

  dolarData: any[] = [];
  precioCompra: number = 0;
  userPesos: number = 0;

  dolaresAComprar: number = 0;
  maxDolares: number = 0;

  loading = true;
  errorMessage = '';
  botonDisabled = true;

  constructor(
    private dolarService: DolarService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.cargarPerfil();
    this.cargarCotizaciones();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      const data = await this.authService.getUserData();
      this.userPesos = data?.['user_pesos'] ?? 0;
      if (this.precioCompra > 0) {
        this.maxDolares = +(this.userPesos / this.precioCompra).toFixed(2);
        this.validarCompra();
      }
    } catch (error) {
      console.error('Error cargando perfil', error);
      this.userPesos = 0;
    }
  }

  cargarCotizaciones() {
    this.dolarService.llamarApiDolar().subscribe({
      next: (data) => {
        this.dolarData = data || [];
        this.seleccionarPrecioMasBarato();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando cotizaciones:', error);
        this.errorMessage = 'Error cargando cotizaciones';
        this.loading = false;
      }
    });
  }

  seleccionarPrecioMasBarato() {
    const cotizacionesValidas = this.dolarData.filter(d => !d.nombre.toLowerCase().includes('tarjeta'));
    if (!cotizacionesValidas.length) {
      this.errorMessage = 'No se encontraron cotizaciones válidas.';
      return;
    }
    this.precioCompra = Math.min(...cotizacionesValidas.map(c => c.compra));
    this.maxDolares = +(this.userPesos / this.precioCompra).toFixed(2);
    this.validarCompra();
  }

  validarCompra() {
    if (this.dolaresAComprar <= 0) {
      this.errorMessage = 'Ingrese una cantidad mayor que cero.';
      this.botonDisabled = true;
      return;
    }
    if (this.dolaresAComprar > this.maxDolares) {
      this.errorMessage = `No tienes saldo suficiente. Máximo permitido: ${this.maxDolares} dólares.`;
      this.botonDisabled = true;
      return;
    }
    this.errorMessage = '';
    this.botonDisabled = false;
  }

  comprar() {
    if (this.botonDisabled) return;

    const montoPesos = +(this.dolaresAComprar * this.precioCompra).toFixed(2);

    this.authService.comprarDolares(montoPesos, this.precioCompra).subscribe({
      next: async () => {
        await this.mostrarConfirmacionCompra(this.dolaresAComprar, this.precioCompra);
        this.userPesos -= montoPesos;
        this.maxDolares = +(this.userPesos / this.precioCompra).toFixed(2);
        this.dolaresAComprar = 0;
        this.botonDisabled = true;
      },
      error: async (e) => {
        console.error('Error en la compra', e);
        await this.mostrarError('Error procesando la compra');
      }
    });
  }

  async mostrarConfirmacionCompra(cantidadDolares: number, precio: number) {
    const alert = await this.alertCtrl.create({
      header: 'Compra exitosa',
      message: `Compraste ${cantidadDolares} dólares a $${precio} por dólar.`,
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
