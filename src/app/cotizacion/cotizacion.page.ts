import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { DolarService } from '../auth/dolar.service'; // Ajustá ruta si es necesario

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.page.html',
  styleUrls: ['./cotizacion.page.scss'],
  standalone: false,
})
export class CotizacionPage implements OnInit {

  token: string | null = null;
  dolarData: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private dolarService: DolarService
  ) { }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnInit() {
    this.token = this.authService.getToken();
    this.cargarCotizaciones();
  }

  cargarCotizaciones() {
    this.dolarService.llamarApiDolar().subscribe({
      next: (data) => {
        this.dolarData = data;
      },
      error: (error) => {
        console.error('Error cargando cotizaciones:', error);
      }
    });
  } 
}
