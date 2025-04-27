import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comprar',
  templateUrl: './comprar.page.html',
  styleUrls: ['./comprar.page.scss'],
  standalone: false
})
export class ComprarPage implements OnInit {

  token: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

    this.token = this.authService.getToken();

  }
}