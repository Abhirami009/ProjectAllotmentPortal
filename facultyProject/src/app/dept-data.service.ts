import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { department } from './models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeptDataService {
apiUrl = 'http://localhost:5001/department'
  constructor(private http : HttpClient) { }
getDepartment(): Observable<department[]> {
      return this.http.get<department[]>(`${this.apiUrl}`).pipe(
        map((data: any[]) =>
          data.map((dept) => ({
            dept_id: dept.dept_id,
            dept_name : dept.dept_name,
          }) as department)
        )
      );
    }
}
