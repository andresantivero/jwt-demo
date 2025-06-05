import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TipoTransaccionNombre } from '../auth/transactions.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {
  transacciones: any[] = [];
  transaccionesPaginadas: any[] = [];

  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUserTransactionsRealtime((transacciones) => {
      this.transacciones = transacciones
        .sort((a, b) => {
          const fechaA = a.transaccion_fecha.toDate();
          const fechaB = b.transaccion_fecha.toDate();
          return fechaB.getTime() - fechaA.getTime();
        });

      this.totalPages = Math.ceil(this.transacciones.length / this.pageSize);
      this.actualizarPagina();
    });
  }

  actualizarPagina() {
    const inicio = (this.currentPage - 1) * this.pageSize;
    const fin = inicio + this.pageSize;
    this.transaccionesPaginadas = this.transacciones.slice(inicio, fin);
  }

  siguientePagina() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.actualizarPagina();
    }
  }

  anteriorPagina() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.actualizarPagina();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  getTipoNombre(tipo: number): string {
    return TipoTransaccionNombre[tipo] || 'Desconocido';
  }
}
