import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false // Asegúrate de que este componente no sea standalone
})
export class PerfilPage implements OnInit {
  user: any = {};

  constructor(private authService: AuthService, private camera: Camera) {}

  async ngOnInit() {
    this.user = await this.authService.getUserData();
  }

  async tomarFotoPerfil() {
    const options: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 600,
      targetHeight: 600,
      correctOrientation: true
    };

    try {
      const imageData = await this.camera.getPicture(options);
      const base64Image = 'data:image/jpeg;base64,' + imageData;
      await this.authService.actualizarFotoUsuario(base64Image);
      this.user = await this.authService.getUserData();
    } catch (err) {
      console.error('Error al tomar la foto', err);
    }
  }
}