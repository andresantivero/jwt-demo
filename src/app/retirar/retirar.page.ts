import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-retirar',
  templateUrl: './retirar.page.html',
  styleUrls: ['./retirar.page.scss'],
  standalone: false
})
export class RetirarPage implements OnInit {

   token: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit() {

    this.token = this.authService.getToken();

  }
}