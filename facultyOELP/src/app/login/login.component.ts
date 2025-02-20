import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectDataService } from '../project-data.service';
import { Faculty } from '../interfaces';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  faculty : Faculty | undefined;
  loginError : string ="";

  constructor (private fb : FormBuilder, private authService : AuthenticationService, private router: Router){}
  
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });


  }

  onSubmit(): void {
    if (this.loginForm?.valid) {
      const loginData = this.loginForm.value;
      console.log('Login Data:', loginData);
    }

    const faculty = this.authService.getFacultydata(this.loginForm.value.email, this.loginForm.value.password);
    if (faculty) {
      alert('Login Successful!');
      this.faculty = faculty;
      console.log('Faculty Data:', this.faculty);  // Check console for data
      localStorage.setItem('faculty', JSON.stringify(this.faculty));
      
      this.router.navigate(['faculty-dashboard']);
      
      // Navigate to dashboard or perform further actions
    } else {
      this.loginError = 'Invalid email or password';
    }

   
  }
}
