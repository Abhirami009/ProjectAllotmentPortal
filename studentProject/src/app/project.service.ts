import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { projApplication, project } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = 'http://localhost:5001/projects';
  apiUrl_apply = 'http://localhost:5001/add_application'
  apiUrl_delete = 'http://localhost:5001/delete_application'
  constructor(private http : HttpClient) { }

  getProjects(): Observable<project[]> {
      return this.http.get<project[]>(this.apiUrl).pipe(
        map((data: any[]) =>
          data.map((proj) => ({
            project_id : proj.project_id,
            title : proj.title,
            min_cgpa : proj.min_cgpa,
            description : proj.description,
            faculty_name : proj.faculty,
            min_year : proj.min_year,
            prerequisites : proj.prerequisites,
            documents : proj.documents,
            department : proj.department,
            students_per_team : proj.students_per_team,
            available_slots : proj.available_slots

          }) as project)
        )
      );
    }
    // addProject(project: project, faculty_id : number): Observable<any> {
    //   const proj = {...project, faculty_id : faculty_id};
    //   return this.http.post(`${this.apiUrl_common}/add_project`, proj);
    // }
  applyProject(projapp : projApplication, student_id : number){
    const app = {...projapp, ...projapp, student_id : student_id};
    console.log("hiiiii",app);
    return this.http.post(`${this.apiUrl_apply}`, app);
  }

  removeApp(project_id: number, student_id: number) {
    const body = { project_id, student_id };
  
    return this.http.delete(`${this.apiUrl_delete}`, {
      body, // Correct way to pass body in DELETE request
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }
  
}
