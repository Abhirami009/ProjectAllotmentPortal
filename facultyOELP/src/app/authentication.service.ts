import { Injectable } from '@angular/core';
import { ProjectDataService } from './project-data.service';
import { Faculty } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  facultyArr : Faculty[] = {} as Faculty[];
  constructor(private service : ProjectDataService) { }

  getallfac(){
    this.service.getFaculty().subscribe(
      {
        next : data => {
          this.facultyArr = data;
          console.log(data);
        }
      },
  
    );
  }

  getFacultydata (email : string, password : string){
    this.getallfac();
    const faculty = this.facultyArr.find(faculty => 
      faculty.email === email && faculty.password === password
    );
    return faculty ? faculty : null;
  }
}
