import { Component, Input, Output,EventEmitter } from '@angular/core';
import { FacultydataService } from '../facultydata.service';
import { course, department, faculty, project } from '../models';
import { ProjectsService } from '../projects.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseDataService } from '../course-data.service';
import { DeptDataService } from '../dept-data.service';
// import { EventEmitter } from 'stream';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css'
})
export class AddProjectComponent {
  @Input() faculty: faculty = {} as faculty;
  @Output() addproj = new EventEmitter<boolean>();

  newProject: project = {
    project_id: 0,
    title: '',
    min_cgpa: 0,
    description: '',
    available_slots: 0,
    students_per_team: 0,
    prerequisites: [] as course[], // ✅ Ensure prerequisites is always initialized
    documents: [],
    min_year: 0,
    department : []
  };

  tempDocName: string = '';
  tempDocUrl: string = '';

  successMessage = '';

  courses: course[] = [];
  searchQuery: string = '';
  searchQuery_dept: string = '';
  filteredCourses: course[] = [];
  filteredDept : department[] = [];
  dept: department[] = [];

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
    if (!this.newProject.prerequisites?.some(p => p.course_id === course.course_id)) {
      this.newProject.prerequisites?.push({ 
        course_id: course.course_id, 
        course_name: course.course_name, 
        credits: course.credits, 
        course_code: course.course_code 
      });
    }
    this.searchQuery = ''; // Clear search field after selection
    this.filteredCourses = []; // Hide search results
  }

  removePrerequisite(index: number): void {
    this.newProject.prerequisites?.splice(index, 1);
  }

  addDocument(docName: string, docUrl: string): void {
    if (docName && docUrl) {
      this.newProject.documents?.push({ doc_name: docName, doc_url: docUrl });
      this.tempDocName = '';
      this.tempDocUrl= '';
    } else {
      alert('Please provide both document name and URL.');
    }
  }
  

  removeDocument(index: number): void {
    this.newProject.documents?.splice(index, 1);
  }

  addProject(): void {
    if (this.newProject && this.faculty?.faculty_id) {
      const newProject = {
        ...this.newProject,
        faculty_id: this.faculty.faculty_id, // Ensure faculty_id is included
      };
      console.log(newProject);
      this.facservice.addProject(newProject, this.faculty.faculty_id).subscribe({
        next: (response) => {
          console.log("Project added successfully:", response);
          this.successMessage = 'Project added successfully!';
        },
        error: (error) => {
          console.error("Error adding project:", error);
        }
      });
      this.newProject = {
        project_id: 0,
        title: '',
        min_cgpa: 0,
        description: '',
        available_slots: 0,
        students_per_team: 0,
        prerequisites: [] as course[],
        documents: [],
        min_year: 0,
        department : []
      };
      this.addproj.emit(false);
    } else {
      alert('Please fill in all required fields.');
    }


  }




  searchDept() {
    if (this.searchQuery_dept.trim() === '') {
      this.filteredCourses = [];
      return;
    }
    this.filteredDept = this.dept.filter(dept =>
      dept.dept_name.toLowerCase().includes(this.searchQuery_dept.toLowerCase()) 
    );
  }

  selectDept(dept: department): void {
    if (!this.newProject.department?.some(p => p.dept_id === dept.dept_id)) {
      this.newProject.department?.push({ 
        dept_id : dept.dept_id,
        dept_name : dept.dept_name
      });
    }
    this.searchQuery_dept = ''; // Clear search field after selection
    this.filteredDept = []; // Hide search results
  }

  removeDept(index: number): void {
    this.newProject.department?.splice(index, 1);
  }
}
