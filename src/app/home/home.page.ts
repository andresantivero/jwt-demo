import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
    token: string | null = null;
    constructor(private authService: AuthService, private router: Router) {}
    ngOnInit() {
    this.token = this.authService.getToken();
    }
    logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
    }
   }