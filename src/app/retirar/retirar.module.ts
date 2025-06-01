import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RetirarPageRoutingModule } from './retirar-routing.module';

import { RetirarPage } from './retirar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RetirarPageRoutingModule
  ],
  declarations: [RetirarPage]
})
export class RetirarPageModule {}
