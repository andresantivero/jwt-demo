import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, CameraPermissionType } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  currentView = 'login';
  credentials = { username: '', password: '' };
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: ''
  };
  isMobile = false;
  forgotData = { email: '' };
  errorMessage = '';
  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private platform: Platform
  ) {
    this.isMobile = this.platform.is('mobile');
  }

  ngOnInit() {}

  async takePicture() {
    try {
      if (!this.platform.is('mobile') && !this.platform.is('hybrid')) {
        return await this.takePictureWeb();
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Tomar foto',
        promptLabelPhoto: 'Seleccionar de la galería',
        promptLabelPicture: 'Tomar foto',
        promptLabelCancel: 'Cancelar',
        width: 600,
        correctOrientation: true
      });
      
      if (image?.dataUrl) {
        this.registerData.profileImage = image.dataUrl;
        this.showToast('Imagen cargada correctamente', 'success');
      }
    } catch (error: any) {
      console.error('Error al tomar la foto:', error);
      this.handleCameraError(error);
    }
  }

  private async takePictureWeb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          reject(new Error('No se seleccionó ningún archivo'));
          return;
        }

        try {
          const reader = new FileReader();
          const imageUrl = await new Promise<string>((resolveReader, rejectReader) => {
            reader.onload = (e: any) => resolveReader(e.target.result as string);
            reader.onerror = () => rejectReader(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
          });
          
          this.registerData.profileImage = imageUrl;
          this.showToast('Imagen cargada correctamente', 'success');
          resolve();
        } catch (error) {
          console.error('Error en takePictureWeb:', error);
          this.handleCameraError(error);
          reject(error);
        }
      };

      input.oncancel = () => {
        reject(new Error('Selección cancelada por el usuario'));
      };

      input.click();
    });
  }

  async selectFromGallery() {
    try {
      if (this.isMobile) {
        const permission = await Camera.checkPermissions();
        if (permission.photos !== 'granted') {
          const newPermission = await Camera.requestPermissions();
          if (newPermission.photos !== 'granted') {
            this.showToast('Se requiere permiso para acceder a la galería', 'warning');
            return;
          }
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        webUseInput: true,
        width: 600,
        correctOrientation: true
      });
      
      if (image?.dataUrl) {
        this.registerData.profileImage = image.dataUrl;
        this.showToast('Imagen cargada correctamente', 'success');
      }
    } catch (error: any) {
      console.error('Error al seleccionar la imagen:', error);
      this.handleCameraError(error);
    }
  }

  private handleCameraError(error: any): void {
    console.error('Error en la cámara:', error);
    if (error?.message?.includes('cancel') || error === 'User cancelled photos app') {
      this.showToast('Operación cancelada', 'warning');
    } else if (error?.message?.includes('permission')) {
      this.showToast('Permiso denegado para acceder a la cámara', 'danger');
    } else {
      this.showToast('Error al acceder a la cámara: ' + (error?.message || 'Error desconocido'), 'danger');
    }
  }

  private async showToast(message: string, color: string = 'primary'): Promise<void> {
    try {
      const toast = await this.toastController.create({
        message,
        duration: 2000,
        color,
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('Error al mostrar toast:', error);
    }
  }

  async login() {
    this.errorMessage = '';
    this.loading = await this.loadingController.create({
      message: 'Iniciando sesión...'
    });
    await this.loading.present();

    this.authService.login(this.credentials).pipe(
      finalize(() => this.loading?.dismiss())
    ).subscribe({
      next: (res) => {
        if (res) {
          this.credentials.username = '';
          this.credentials.password = '';
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.showToast(this.errorMessage, 'danger');
      }
    });
  }

  async register() {
    // Implementación de registro
  }

  async resetPassword() {
    // Implementación de reseteo de contraseña
  }

  changeView(view: string) {
    this.currentView = view;
    this.errorMessage = '';
  }
}
