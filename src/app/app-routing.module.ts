import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './register/register';
import { Itineraries } from './pages/itineraries/itineraries';
import { Activities } from './pages/activities/activities';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', component: Home},
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'itineraries', component: Itineraries, canActivate: [AuthGuard] },
  { path: 'itineraries/:id/activities', component: Activities },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
