import { Component, Input, SimpleChanges } from '@angular/core';
import { ProjectsService } from '../projects.service';
import { faculty, project } from '../models';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { ProjectDetailsComponent } from "../project-details/project-details.component";
import { AddProjectComponent } from "../add-project/add-project.component";

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, ProjectDetailsComponent, AddProjectComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent {
  @Input() faculty!: faculty;

projects : project[] = [] as project[];

showProj : boolean = false;
 addproj : boolean = false;
 selectedProject : project = {} as project;
 newProject : project = {} as project;

 page: number = 1;

 selectProject(project : project){
  this.selectedProject = project;
  console.log(project);
  this.showProj = true;
}

AddProj(){
  this.addproj = true;
  console.log(this.newProject);
}

back(event : boolean){
  this.addproj = event;
}
  constructor(private serv : ProjectsService ){

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['faculty'] && this.faculty?.faculty_id) {
      this.loadProjects();
    }
  }

  private loadProjects(): void {
    this.serv.getProjects(this.faculty.faculty_id).subscribe({
      next: (projectData) => {
        this.projects = projectData;
        console.log('Projects:', this.projects);
      },
      error: (error) => {
        console.error('Error fetching projects:', error);
        alert('Failed to load faculty projects. Please try again.');
      }
    });
  }
  
  backfromProject(event : boolean){
    this.showProj = event;
  }


}
