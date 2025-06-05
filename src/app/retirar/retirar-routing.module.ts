import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RetirarPage } from './retirar.page';

const routes: Routes = [
  {
    path: '',
    component: RetirarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RetirarPageRoutingModule {}
