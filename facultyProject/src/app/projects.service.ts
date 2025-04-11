import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { project } from './models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  id : number| undefined;
  private apiUrl = 'http://localhost:5001/faculty_project';
  private apiUrl_common = 'http://localhost:5001'
  private apiurlforcourse = 'http://localhost:5001/course';
  constructor(private http : HttpClient) { }

  getProjects(id : number): Observable<project[]> {
    return this.http.get<project[]>(`${this.apiUrl}/${id}`).pipe(
      map((data: any[]) =>
        data.map((project) => ({
          project_id: project.project_id,
          title : project.title,
          description : project.description,
          min_cgpa : project.min_cgpa,
          available_slots : project.available_slots,
          students_per_team : project.students_per_team,
          prerequisites : project.prerequisites,
          documents : project.documents,
          min_year : project.min_year,
          department : project.department
        }) as project)
      )
    );
  }

  addProject(project: project, faculty_id : number): Observable<any> {
    const proj = {...project, faculty_id : faculty_id};
    return this.http.post(`${this.apiUrl_common}/add_project`, proj);
  }

  updateProject(project: project): Observable<any> {
    return this.http.put(`${this.apiUrl_common}/update_project`, project);
  }

  

}
