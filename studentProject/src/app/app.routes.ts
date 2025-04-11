import { Routes } from '@angular/router';
import { InputComponent } from './input/input.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
	{ path: '', component: InputComponent }, // Default route is the login page
	{ path: 'student-dashboard', component: HomeComponent }
];
