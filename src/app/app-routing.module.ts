import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },  
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard] // 👉 ACA protegemos la ruta con AuthGuard
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },   {
    path: 'cotizacion',
    loadChildren: () => import('./cotizacion/cotizacion.module').then( m => m.CotizacionPageModule),
    canActivate: [AuthGuard] // 👉 ACA protegemos la ruta con AuthGuard
  },
  {
    path: 'saldo',
    loadChildren: () => import('./saldo/saldo.module').then( m => m.SaldoPageModule),
    canActivate: [AuthGuard] // 👉 ACA protegemos la ruta con AuthGuard
  },
  {
    path: 'comprar',
    loadChildren: () => import('./comprar/comprar.module').then( m => m.ComprarPageModule),
    canActivate: [AuthGuard] // 👉 ACA protegemos la ruta con AuthGuard
  },
  {
    path: 'vender',
    loadChildren: () => import('./vender/vender.module').then( m => m.VenderPageModule),
    canActivate: [AuthGuard] // 👉 ACA protegemos la ruta con AuthGuard
  },
  {
    path: 'historial',
    loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule),
    canActivate: [AuthGuard] // 👉 ACA protegemos la ruta con AuthGuard
  },

 
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
