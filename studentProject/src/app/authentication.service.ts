import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { user } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl = 'http://localhost:5001/users_students';

  constructor(private httpserv: HttpClient) {}

  // Fetch users from API
  getUsers(): Observable<user[]> {
    return this.httpserv.get<user[]>(this.apiUrl).pipe(
      map((data: any[]) =>
        data.map((user) => ({
          user_id: user.user_id,
          password: user.password,
        }) as user)
      )
    );
  }

  login(userId: number, password: string): Observable<number | null> {
    return this.getUsers().pipe(
      map((users: user[]) => {
        const user = users.find((u) => u.user_id === userId && u.password === password);
        return user ? user.user_id : null; // Return user_id if valid, else null
      })
    );
  }
}
