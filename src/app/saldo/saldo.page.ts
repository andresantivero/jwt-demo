
// estas 3 importaciones son necesarias para todas la paginas

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

// agregalas no seas gil!!!

@Component({
  selector: 'app-saldo',
  templateUrl: './saldo.page.html',
  styleUrls: ['./saldo.page.scss'],

  // en todas las paginas hay que agregar standalone: false
  standalone: false
})

export class SaldoPage implements OnInit {

  // agregar desde el token para abajo en todas las pagina nuevas 
  // y las demas funciones que tenga la paginola

  token: string | null = null;
  userData: any = null;

  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    this.token = this.authService.getToken();
    if (!this.token) {
      this.router.navigateByUrl('/login');
      return;
    }

    try {
      this.userData = await this.authService.getUserData();
      if (!this.userData) {
        console.error('No se encontraron datos del usuario');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  }

  ionViewWillEnter() {
    // Actualizar los datos cada vez que se entre a la página
    this.loadUserData();
  }

  private async loadUserData() {
    try {
      this.userData = await this.authService.getUserData();
      if (!this.userData) {
        console.error('No se encontraron datos del usuario');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  }
}