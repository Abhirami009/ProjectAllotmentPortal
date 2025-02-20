import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student,Project, projApplication, Status, Faculty, Dept  } from './interfaces';
@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
  
  constructor() { }

  private students: Student[] = [
    {
      studentId: "S101",
      name: "Alice Johnson",
      rollNumber: "CSE2201",
      branch: Dept.DS,
      semester: 4,
      cgpa: 3.8,
      completedCourses: []
    },
    {
      studentId: "S102",
      name: "Bob Williams",
      rollNumber: "DS2202",
      branch: Dept.DS,
      semester: 5,
      cgpa: 3.6,
      completedCourses: []
    }
  ];

  private facultyMembers: Faculty[] = [
    {
      facultyId: 201,
      name: "Dr. Emily Smith",
      password : "emily201",
      email: "emily.smith@university.edu",
      department: Dept.CS
    },
    {
      facultyId: 202,
      name: "Dr. James Brown",
      password : "James202",
      email: "james.brown@university.edu",
      department: Dept.DS
    }
  ];

  private projects: Project[] = [
    {
      projectId: 301,
      facultyId: 201,
      title: "AI-Powered Chatbot",
      description: "Develop a chatbot using NLP techniques and deep learning.",
      eligibilityCriteria: {
        requiredCourses: [],
        minCgpa: 3.5,
        departments: [Dept.CS, Dept.DS],
        minSemester: 4
      },
      slotsAvailable: 2,
      studentsPerTeam: 3
    },
    {
      projectId: 302,
      facultyId: 202,
      title: "Blockchain-Based Voting System",
      description: "A secure and transparent voting system leveraging blockchain technology.",
      eligibilityCriteria: {
        requiredCourses: [],
        minCgpa: 3.7,
        departments: [Dept.CS, Dept.EE],
        minSemester: 5
      },
      slotsAvailable: 3,
      studentsPerTeam: 2
    }
  ];

  private applications: projApplication[] = [
    {
      applicationId: 401,
      students: [this.students[0]],
      projectId: 301,
      status: Status.PENDING,
      docs: [{ name: "Resume_Alice.pdf", url: "https://example.com/resume_alice.pdf" }],
      timestamp: new Date("2025-02-10T10:30:00Z"),
      facultyComments: undefined
    },
    {
      applicationId: 402,
      students: [this.students[1]],
      projectId: 302,
      status: Status.APPROVED,
      docs: [{ name: "Resume_Bob.pdf", url: "https://example.com/resume_bob.pdf" }],
      timestamp: new Date("2025-02-11T12:45:00Z"),
      facultyComments: "Strong application, approved."
    }
  ];

  // Service methods to return mock data as observables
  getStudents(): Observable<Student[]> {
    return of(this.students);
  }

  getFaculty(): Observable<Faculty[]> {
    return of(this.facultyMembers);
  }

  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  getApplications(): Observable<projApplication[]> {
    return of(this.applications);
  }
}
