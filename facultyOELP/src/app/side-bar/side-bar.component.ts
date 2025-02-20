import { Component, Input } from '@angular/core';
import { Faculty, projApplication, Project, Status } from '../interfaces';
import { ProjectDataService } from '../project-data.service';
import { Application } from 'express';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent  {

@Input() faculty : Faculty = {} as Faculty;
@Input() projects : Project[] = [] ;

applications_all : projApplication[] = [] ;

forfac : projApplication[] = [] ;
selectedStatus: Status = Status.PENDING;
filteredApplications: projApplication[] = [];

status = Status;

// Counters for sidebar badges
pendingCount = 0;
approvedCount = 0;
rejectedCount = 0;

constructor(private service : ProjectDataService){}

ngOnInit(): void {
  this.service.getApplications().subscribe({
    next: (data) => {
      this.applications_all = data;
      console.log("All Applications:", data);

      // Call getApplications after receiving data
      this.getApplications();
      
      // Now update the counts and filtered list
      this.updateCounts();
      this.filterApplications(Status.PENDING);
    },
    error: (err) => console.error("Error fetching applications:", err),
  });
}


getApplications() {
  if (!this.faculty || !this.faculty.facultyId) {
    console.warn("Faculty data is missing.");
    return;
  }

  // Step 1: Get projects created by the given faculty
  const facultyProjects = this.projects.filter(
    (project) => project.facultyId === this.faculty.facultyId
  );

  // Step 2: Extract project IDs
  const facultyProjectIds = facultyProjects.map((project) => project.projectId);

  // Step 3: Filter applications that belong to these projects
  this.forfac = this.applications_all.filter((application) =>
    facultyProjectIds.includes(application.projectId)
  );

  console.log("Filtered Applications for Faculty:", this.forfac);
}



// Function to filter applications based on status
filterApplications(status: Status) {
  this.selectedStatus = status;
  this.filteredApplications = this.forfac.filter(app => app.status === status);
}

// Get project title from projectId
getProjectTitle(projectId: number): string {
  const project = this.projects.find(proj => proj.projectId === projectId);
  return project ? project.title : "Unknown Project";
}

updateCounts() {
  this.pendingCount = this.forfac.filter((app) => app.status === Status.PENDING).length;
  this.approvedCount = this.forfac.filter((app) => app.status === Status.APPROVED).length;
  this.rejectedCount = this.forfac.filter((app) => app.status === Status.REJECTED).length;
}





}
