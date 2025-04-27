import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({

	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: false,

})

export class LoginPage implements OnInit {

	credentials = {

		username: '',
		password: '',

	};

	errorMessage: string = '';

	loading: HTMLIonLoadingElement | null = null;

	constructor(

		private authService: AuthService,
		private router: Router,
		private loadingController: LoadingController

	) { }

	ngOnInit() { }

	async login() {

		this.loading = await this.loadingController.create({

			message: 'Iniciando sesión...',

		});

		await this.loading.present();

		this.authService.login(this.credentials).subscribe({

			next: (res) => {

				this.loading?.dismiss();

				if (res) {

					this.router.navigateByUrl('/home');

				} else {

					this.errorMessage = 'Credenciales incorrectas.';

				}

			}, error: (err) => {

				this.loading?.dismiss();
				this.errorMessage = 'Error al iniciar sesión.';
				console.error(err);

			}
		});
	}
}