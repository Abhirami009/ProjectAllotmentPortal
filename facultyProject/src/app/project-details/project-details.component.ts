import { Component, EventEmitter, Input, Output } from '@angular/core';
import { course, department, project } from '../models';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../projects.service';
import { CourseDataService } from '../course-data.service';
import { DeptDataService } from '../dept-data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent {
 @Input() project : project = {} as project;
 @Output() back = new EventEmitter<boolean>();
 isEditing : boolean = false;
 tempDocName: string = '';
  tempDocUrl: string = '';

 courses: course[] = [];
   searchQuery: string = '';
   searchQuery_dept: string = '';
   filteredCourses: course[] = [];
   filteredDept : department[] = [];
   dept: department[] = [];

   editableProject : project = this.project;

   constructor(private facservice: ProjectsService, private couservice: CourseDataService, private deptservice : DeptDataService) {}



 ngOnInit(): void {
  this.couservice.getCourses().subscribe({
    next: (data) => {
      this.courses = data;
      console.log('All Courses:', data);
    }
  });

  this.deptservice.getDepartment().subscribe({
    next: (data) => {
      this.dept = data;
      console.log('All Courses:', data);
    }
  });
}

toggleEdit() {
  this.isEditing = true;
  this.editableProject = JSON.parse(JSON.stringify(this.project)); // Deep copy
}

searchCourses() {
  if (this.searchQuery.trim() === '') {
    this.filteredCourses = [];
    return;
  }
  this.filteredCourses = this.courses.filter(course =>
    course.course_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
    course.course_code.toLowerCase().includes(this.searchQuery.toLowerCase())
  );
}

selectCourse(course: course): void {
  if (!this.editableProject.prerequisites?.some(p => p.course_id === course.course_id)) {
    this.editableProject.prerequisites = [
      ...(this.editableProject.prerequisites || []), 
      { 
        course_id: course.course_id, 
        course_name: course.course_name, 
        credits: course.credits, 
        course_code: course.course_code 
      }
    ];
  }
  this.searchQuery = ''; // Clear search field after selection
  this.filteredCourses = []; // Hide search results
}

removePrerequisite(index: number): void {
  this.editableProject.prerequisites?.splice(index, 1);
}

addDocument(docName: string, docUrl: string): void {
  if (docName && docUrl) {
    this.editableProject.documents = [
      ...(this.editableProject.documents || []), 
      { doc_name: docName, doc_url: docUrl }
    ];
    this.tempDocName = '';
    this.tempDocUrl = '';
  } else {
    alert('Please provide both document name and URL.');
  }
}

removeDocument(index: number): void {
  this.editableProject.documents?.splice(index, 1);
}

searchDept() {
  if (this.searchQuery_dept.trim() === '') {
    this.filteredDept = [];
    return;
  }
  this.filteredDept = this.dept.filter(dept =>
    dept.dept_name.toLowerCase().includes(this.searchQuery_dept.toLowerCase()) 
  );
}

selectDept(dept: department): void {
  if (!this.editableProject.department?.some(p => p.dept_id === dept.dept_id)) {
    this.editableProject.department = [
      ...(this.editableProject.department || []),
      {
        dept_id: dept.dept_id,
        dept_name: dept.dept_name
      }
    ];
  }
  this.searchQuery_dept = ''; // Clear search field after selection
  this.filteredDept = []; // Hide search results
}

removeDept(index: number): void {
  this.editableProject.department?.splice(index, 1);
}

saveChanges() {
  this.project = { ...this.editableProject }; // Save changes to main project object
  this.isEditing = false;
  this.facservice.updateProject(this.editableProject).subscribe({
    next: (response) => {
      console.log('Project updated successfully:', response);
      this.project = { ...this.editableProject }; // Update UI with saved data
      this.isEditing = false;
    },
    error: (error) => {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  });
}



cancelChanges() {
  this.isEditing = false; // Simply exit edit mode
}

goback(){
  this.back.emit(false);
}

}
