import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { App } from './app';
import { Login } from './pages/login/login';
import { Register } from './register/register';
import { Home } from './pages/home/home';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/firebase-config';

@NgModule({
  declarations: [
  ],
  imports: [
    App,
    Login,
    Register,
    Home,
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }