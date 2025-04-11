import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { course } from './models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseDataService {
apiUrl = 'http://localhost:5001/courses';
  constructor(private http : HttpClient) { }

  getCourses(): Observable<course[]> {
      return this.http.get<course[]>(`${this.apiUrl}`).pipe(
        map((data: any[]) =>
          data.map((course) => ({
            course_id: course.course_id,
            course_name : course.course_name,
            credits : course.credits,
            course_code : course.course_code
          }) as course)
        )
      );
    }
}
