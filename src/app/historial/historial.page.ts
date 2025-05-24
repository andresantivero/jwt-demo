import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TipoTransaccionNombre } from '../auth/transactions.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {
  transacciones: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getUserTransactionsRealtime((transacciones) => {
      this.transacciones = transacciones;
      console.log('Transacciones actualizadas:', this.transacciones);
    });
  }

  getTipoNombre(tipo: number): string {
    return TipoTransaccionNombre[tipo] || 'Desconocido';
  }
}
