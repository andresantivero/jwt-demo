import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  token: string | null = null;
  username: string = '';  // Variable para el nombre de usuario

  constructor(private authService: AuthService, private router: Router, private faio: FingerprintAIO) {}

  async ngOnInit() {
    this.token = this.authService.getToken();
    const userData = await this.authService.getUserData();
    // Ajusta el campo según cómo guardes el nombre en Firestore
    this.username = userData?.['name'] || userData?.['displayName'] || userData?.['email'] || 'Usuario';
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  autenticarHuella(path: string) {
    this.faio
      .show({
        title: 'Autenticación requerida',
        subtitle: 'Escanea tu huella digital',
        description: 'Para continuar, verifica tu identidad',
        disableBackup: true,
      })
      .then(() => {
        this.router.navigate([path]);
      })
      .catch((error) => {
        console.log('Autenticación cancelada o fallida', error);
      });
  }
}
