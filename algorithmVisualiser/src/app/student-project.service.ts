import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preference } from './models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentProjectService {
  apiUrl_p = 'http://localhost:5001/getProjectpreferences_Visualiser';
  apiUrl_s = 'http://localhost:5001/getStudentpreferences_Visualiser';
  apiUrl_a = 'http://localhost:5001/getAvailableSlots'

  constructor(private http: HttpClient) { }


  getAvailableSlots(title : string) : Observable<number>{
    return this.http.get<number>(`${this.apiUrl_a}/${title}`);
  }

  getProjectpref(): Observable<Preference[]> {
    return this.http.get<Preference[]>(`${this.apiUrl_p}`).pipe(
      map((data: any[]) =>
        data.map((project) => ({
          student : btoa(project.student_name),
          project : project.project_name,
          preference_rank : project.preference_rank
        }) as Preference)
      )
    );
  }

  getStudpref(): Observable<Preference[]> {
    return this.http.get<Preference[]>(`${this.apiUrl_s}`).pipe(
      map((data: any[]) =>
        data.map((project) => ({
          student : btoa(project.student_name),
          project : project.project_name,
          preference_rank : project.preference_rank
        }) as Preference)
      )
    );
  }

}
