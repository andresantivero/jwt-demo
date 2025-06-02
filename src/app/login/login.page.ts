import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})

export class LoginPage implements OnInit {
  currentView = 'login';

  credentials = {
    username: '',
    password: '',
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  forgotData = {
    email: '',
  };

  errorMessage: string = '';
  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async login() {
    this.errorMessage = '';
    this.loading = await this.loadingController.create({
      message: 'Iniciando sesión...'
    });
    await this.loading.present();

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.loading?.dismiss();
        if (res) {
          this.credentials.username = '';
          this.credentials.password = '';
          this.router.navigateByUrl('/home');
        } else {
          this.credentials.username = '';
          this.credentials.password = '';
          this.errorMessage = 'Credenciales incorrectas.';
        }
      },
      error: (err) => {
        this.loading?.dismiss();
        this.credentials.username = '';
        this.credentials.password = '';
        this.errorMessage = 'Error al iniciar sesión.';
        console.error(err);
      }
    });
  }

  async register() {
    this.errorMessage = '';

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = await this.loadingController.create({
      message: 'Registrando usuario...'
    });
    await this.loading.present();

    // Aquí deberías llamar al servicio de autenticación para registrar al usuario
    this.authService.register({
      name: this.registerData.name,
      email: this.registerData.email,
      password: this.registerData.password
    }).subscribe({
      next: () => {
        this.loading?.dismiss();
        this.showToast('Usuario registrado exitosamente', 'success');
        this.currentView = 'login';
        // Limpiar el formulario
        this.registerData = {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
      },
      error: (err) => {
        this.loading?.dismiss();
        this.errorMessage = 'Error al registrar usuario.';
        console.error(err);
      }
    });
  }

  async resetPassword() {
    this.errorMessage = '';
    this.loading = await this.loadingController.create({
      message: 'Enviando correo de recuperación...'
    });
    await this.loading.present();

    // Aquí deberías llamar al servicio de autenticación para resetear la contraseña
    this.authService.resetPassword(this.forgotData.email).subscribe({
      next: () => {
        this.loading?.dismiss();
        this.showToast('Se ha enviado un correo con las instrucciones para recuperar tu contraseña', 'success');
        this.currentView = 'login';
        this.forgotData.email = '';
      },
      error: (err) => {
        this.loading?.dismiss();
        this.errorMessage = 'Error al enviar el correo de recuperación.';
        console.error(err);
      }
    });
  }
}