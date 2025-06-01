import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  userName: string | null = null;
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    this.authService.isAuthenticated.subscribe(async (auth) => {
      this.isAuthenticated = auth;

      if (auth) {
        const userData = await this.authService.getUserData();
        this.userName = userData?.['user_name'] || this.authService.getCurrentUser()?.displayName || 'Usuario';
      } else {
        this.userName = null;
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
