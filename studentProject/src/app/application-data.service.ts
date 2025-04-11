// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ApplicationDataService {

//   constructor() { }
// }
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { projApplication, preference, facultypreference } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDataService {
  apiUrl_pref = 'http://localhost:5001/savestudentpref';
  apiUrl_fac_pref = 'http://localhost:5001/getstudentranks';
  apiUrl_pref_past = 'http://localhost:5001/getstudentpref';

  constructor(private http: HttpClient) {}

  savePreferences(preferences: any[]) {
    console.log('pref--', preferences);
    return this.http.post(this.apiUrl_pref, { preferences });
  }

  // getPreferences(studentId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`/getstudentpref/${studentId}`);
  // }
  getPreferences(id: number): Observable<preference[]> {
    console.log('sent student id', id);
    return this.http.get<preference[]>(`${this.apiUrl_pref_past}/${id}`).pipe(
      map((data: any[]) =>
        data.map(
          (pref) =>
            ({
              project_id: pref.project_id,
              rank: pref.rank,
            } as preference)
        )
      )
    );
  }

  getStudentRank(studentId: number, projectId: number): Observable<facultypreference> {
    console.log("fetching details",studentId, projectId)
    return this.http.get<facultypreference>(`${this.apiUrl_fac_pref}/${studentId}/${projectId}`);
  }
  
}
