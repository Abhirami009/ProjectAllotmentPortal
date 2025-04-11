import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { faculty } from './models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacultydataService {
  id : number| undefined;
  private apiUrl = 'http://localhost:5001/faculty';
  constructor(private httpserv: HttpClient) { 
  }
  // private apiUrl = 'http://localhost:5001/:'+this.id;

  // export interface faculty {
  //   faculty_id : number,
  //   firstname : string,
  //   lastname : string,
  //   email : string,
  //   phone_no : string,
  //   dept_name : string
  
  // }

  getFaculty(id: number): Observable<faculty> { // 🔹 Change return type to faculty (not array)
    return this.httpserv.get<faculty[]>(`${this.apiUrl}/${id}`).pipe(  // 🔹 Use correct API endpoint
      map((data: any[]) => {
        if (data.length > 0) {
          return {
            faculty_id: data[0].faculty_id,
            firstname: data[0].firstname,
            lastname: data[0].lastname,
            email: data[0].email,
            phone_no: data[0].phone_no,
            dept_name: data[0].dept_name
          } as faculty;
        } else {
          throw new Error('No faculty data found');
        }
      })
    );
  }
  
  
}
