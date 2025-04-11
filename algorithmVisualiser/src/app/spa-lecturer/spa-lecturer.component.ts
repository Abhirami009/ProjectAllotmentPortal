import { Component, OnInit } from '@angular/core';
import {  Preference, StepState } from '../models';
import { CommonModule } from '@angular/common';
import { StudentProjectService } from '../student-project.service';

@Component({
  selector: 'app-spa-lecturer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spa-lecturer.component.html',
  styleUrl: './spa-lecturer.component.css'
})
export class SpaLecturerComponent implements OnInit{

  studP : Preference[]  = [] as Preference[];
  projP : Preference[]  = [] as Preference[];

  projPref :  { [key: string]: string[] } = {};
  studPref : { [key: string]: string[] } = {};
  pData : { [key: string]: { assigned: string[]; capacity: number } } = {} as { [key: string]: { assigned: string[]; capacity: number } };

  objectKeys(obj: any): string[] {
      return obj ? Object.keys(obj) : [];
    }
    
  
    studentAssignments: { [key: string]: string } = {};
    steps: StepState[] = [] as StepState[];
    currentStep = 0;
  
    constructor(private service : StudentProjectService) {
    }



    ngOnInit() {
      this.service.getStudpref().subscribe({
        next: (AppData) => {
          this.studP = AppData || [];
          this.studPref = this.buildStudentProjectMap(this.studP);
          this.tryRunSPA() ;
        },
        error: (error) => {
          console.error('Error fetching student preferences:', error);
          alert('Failed to load student preferences.');
        }
      });
    
      this.service.getProjectpref().subscribe({
        next: async (AppData) => {
          this.projP = AppData || [];
          this.projPref = this.buildProjectStudentMap(this.projP);
          const projectTitles = Object.keys(this.projPref);
    
          await this.fetchAllProjectSlots(projectTitles); // Wait for all slots to be fetched
          this.tryRunSPA() ; // Attempt to run once all data is in
        },
        error: (error) => {
          console.error('Error fetching project preferences:', error);
          alert('Failed to load project preferences.');
        }
      });
    }
    

    tryRunSPA() {
      if (
        this.studPref &&
        this.projPref &&
        Object.keys(this.studPref).length > 0 &&
        Object.keys(this.projPref).length > 0 &&
        Object.keys(this.pData).length === Object.keys(this.projPref).length
      ) {
        this.runLecturerSPA();
      }
    }
    
  
    runLecturerSPA() {
      const remainingStudentPref = JSON.parse(JSON.stringify(this.studPref));
  
      const projectHasFreeSlot = () => {
        return Object.keys(this.projPref).some(title => {
          const project = this.pData[title];
          return (
            project.assigned.length < project.capacity &&
            this.projPref[title].some(sid => remainingStudentPref[sid]?.includes(title))
          );
        });
      };
  
      let stepsCount = 0;
      const maxSteps = 1000;
  
      while (projectHasFreeSlot() && stepsCount++ < maxSteps) {
        for (let project_title of Object.keys(this.projPref)) {
          let project = this.pData[project_title];
          if (project.assigned.length >= project.capacity) continue;
  
          let prefList = this.projPref[project_title];
          for (let student_id of prefList) {
            if (!remainingStudentPref[student_id]?.includes(project_title)) continue;
  
            if (project.assigned.includes(student_id)) continue; // already assigned to this project
  
            let message = '';
            if (this.studentAssignments[student_id]) {
              let oldProject = this.studentAssignments[student_id];
              this.pData[oldProject].assigned = this.pData[oldProject].assigned.filter(s => s !== student_id);
              message += `Student ${student_id} reassigned from Project ${oldProject} to ${project_title}. `;
            } else {
              message += `Student ${student_id} assigned to Project ${project_title}. `;
            }
  
            project.assigned.push(student_id);
            this.studentAssignments[student_id] = project_title;
  
            let idx = remainingStudentPref[student_id].indexOf(project_title);
            if (idx !== -1) {
              let removed = remainingStudentPref[student_id].splice(idx + 1);
              message += `Removed successors from Student ${student_id}'s list: [${removed.join(', ')}].`;
            }
  
            this.steps.push({
              message,
              assignments: JSON.parse(JSON.stringify(this.studentAssignments)),
              studentPref: JSON.parse(JSON.stringify(remainingStudentPref)),
              projectState: JSON.parse(JSON.stringify(this.pData))
            });
  
            break;
          }
        }
      }
    }
  
    nextStep() {
      if (this.currentStep < this.steps.length - 1) this.currentStep++;
    }
  
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    }


buildStudentProjectMap(preferences: Preference[]): { [key: string]: string[] } {
      const studentMap: { [key: string]: any[] } = {};
    
      // Group by student name
      preferences.forEach(pref => {
        const name = pref.student;
        if (!studentMap[name]) {
          studentMap[name] = [];
        }
        studentMap[name].push(pref);
      });
    
      // Sort and extract only project names
      Object.keys(studentMap).forEach(name => {
        studentMap[name].sort((a, b) => a.preference_rank - b.preference_rank);
        studentMap[name] = studentMap[name].map(entry => entry.project);
      });
      console.log("student map",studentMap);
      return studentMap;

    }

    buildProjectStudentMap(preferences: Preference[]): { [key: string]: string[] } {
      const projectMap: { [key: string]: any[] } = {};
      

      preferences.forEach(pref => {
        const name = pref.project;
        if (!projectMap[name]) {
          projectMap[name] = [];
        }
        if (!this.pData[name]){
        this.service.getAvailableSlots(name).subscribe({
          next: (AppData) => {
            console.log('Raw API Response:', AppData); 
            this.pData[name] = {
              capacity: AppData,
              assigned: []
            };
            
            console.log('project preferences:', this.projP);
          },
          error: (error) => {
            console.error('Error fetching slots:', error);
            alert('Failed to load slots. Please try again.');
          }
        });
      }
        projectMap[name].push(pref);
      });

      Object.keys(projectMap).forEach(name => {
        projectMap[name].sort((a, b) => a.preference_rank - b.preference_rank);
        projectMap[name] = projectMap[name].map(entry => entry.student);
      });
      console.log("PROJECT map",projectMap);
      return projectMap;

    }

    fetchAllProjectSlots(projects: string[]): Promise<void> {
      const slotRequests = projects.map(title =>
        this.service.getAvailableSlots(title).toPromise().then(slots => {
          this.pData[title] = {
            capacity: slots || 0,
            assigned: []
          };
        })
      );
    
      return Promise.all(slotRequests).then(() => {});
    }
    
    
}
