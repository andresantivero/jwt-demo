import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { BiometricGuard } from './auth/biometric.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },  
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },   
  {
    path: 'cotizacion',
    loadChildren: () => import('./cotizacion/cotizacion.module').then( m => m.CotizacionPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'saldo',
    loadChildren: () => import('./saldo/saldo.module').then( m => m.SaldoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'comprar',
    loadChildren: () => import('./comprar/comprar.module').then( m => m.ComprarPageModule),
    canActivate: [AuthGuard, BiometricGuard] // Protegido con ambos guards
  },
  {
    path: 'historial',
    loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ingresar',
    loadChildren: () => import('./ingresar/ingresar.module').then( m => m.IngresarPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'retirar',
    loadChildren: () => import('./retirar/retirar.module').then( m => m.RetirarPageModule),
    canActivate: [AuthGuard, BiometricGuard] // Protegido con ambos guards
  },
  {
    path: 'vender',
    loadChildren: () => import('./vender/vender.module').then( m => m.VenderPageModule),
    canActivate: [AuthGuard, BiometricGuard] // Protegido con ambos guards
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule),
    canActivate: [AuthGuard] // Protege la página si lo deseas

  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }