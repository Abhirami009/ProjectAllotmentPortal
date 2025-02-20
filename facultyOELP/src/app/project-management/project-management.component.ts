import { Component, Input } from '@angular/core';
import { Project } from '../interfaces';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.css'
})
export class ProjectManagementComponent {
@Input() projects: Project[] = {} as Project[];

 showProj : boolean = false;
 selectedProject : Project = {} as Project;

 page: number = 1;

 selectProject(project : Project){
  this.selectedProject = project;
}

 


}
