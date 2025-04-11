import { Component, Input } from '@angular/core';
import { faculty } from '../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  @Input()  faculty: faculty = {} as faculty;
}
