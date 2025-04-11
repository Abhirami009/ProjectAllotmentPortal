import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  userid: number = 0;
  password: string = '';
  cgpa: number = 0;
  isNewStudent: boolean = false;
  errorMessage : string = '';

  constructor( private authService : AuthenticationService, private router : Router ){

  }
  onSubmit(form : any){
    this.authService.login(this.userid, this.password).subscribe((authenticatedUserId) => {
      if (authenticatedUserId) {
        console.log('Login Successful! User ID:', authenticatedUserId);
        this.errorMessage = ''; // Clear any previous error
        this.router.navigate(['/student-dashboard'], {
          state: { userId: authenticatedUserId }
        });
         // Example navigation after login
      } else {
        console.error('Invalid credentials');
        this.errorMessage = 'Invalid User ID or Password';
      }
    });
  }



    
}
