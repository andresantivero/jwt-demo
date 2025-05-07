import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vender',
  templateUrl: './vender.page.html',
  styleUrls: ['./vender.page.scss'],
  standalone: false
})
export class VenderPage implements OnInit {

  token: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

    this.token = this.authService.getToken();

  }
}