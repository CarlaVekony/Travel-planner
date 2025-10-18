import {NgModule} from "@angular/core";
import { Routes } from '@angular/router';
import { Home } from "./pages/home/home";
import { Itineraries } from './pages/itineraries/itineraries';
import { Activities } from "./pages/activities/activities";


import { Login } from './pages/login/login';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'itineraries', component: Itineraries },
	{ path: 'activity-planner', component: Activities },
	{ path: 'login', component: Login },
	{ path: '**', redirectTo: '' }
];
