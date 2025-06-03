import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  user: any = {};

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.user = await this.authService.getUserData();
  }

  async tomarFotoPerfil() {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });
    await this.authService.actualizarFotoUsuario(photo.dataUrl!);
    this.user = await this.authService.getUserData(); // Refresca la foto
  }
}