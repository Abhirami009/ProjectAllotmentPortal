import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FacultyDashboardComponent } from './faculty-dashboard/faculty-dashboard.component';

export const routes: Routes = [
	{ path: '', component: LoginComponent },
	{path: 'faculty-dashboard', component : FacultyDashboardComponent}
];

