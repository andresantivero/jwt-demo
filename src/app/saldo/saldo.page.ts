
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

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

    this.token = this.authService.getToken();

  }
}