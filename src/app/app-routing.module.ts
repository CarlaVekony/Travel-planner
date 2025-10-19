import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './register/register';
import { Itineraries } from './pages/itineraries/itineraries';
import { Activities } from './pages/activities/activities';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'itineraries', component: Itineraries, canActivate: [AuthGuard] },
  { path: 'itineraries/:id/activities', component: Activities, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
