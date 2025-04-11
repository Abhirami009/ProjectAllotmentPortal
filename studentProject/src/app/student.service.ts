import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from './interfaces';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  apiUrl = 'http://localhost:5001/student';
  constructor(private http : HttpClient) {

   }

   getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`).pipe(  
      map((data: any) => {  // ✅ data is an object, not an array
        return {
            rollNumber: data.roll_no,
            name: `${data.firstname} ${data.lastname}`,
            email: data.email,
            phone_no: data.phone_no,
            branch: data.branch,
            year: data.year,
            cgpa: data.cgpa,
            completedCourses: data.completedCourses || [], // Ensure it's an array
            applied: data.applications || []
        } as Student;
      })
    );
}

  
  
}
