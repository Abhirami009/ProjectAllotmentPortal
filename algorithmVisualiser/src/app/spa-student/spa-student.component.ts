import { Component } from '@angular/core';
import { Preference, StepState } from '../models';
import { StudentProjectService } from '../student-project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spa-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spa-student.component.html',
  styleUrl: './spa-student.component.css'
})
export class SpaStudentComponent {


  studP : Preference[]  = [] as Preference[];
    projP : Preference[]  = [] as Preference[];
  
    projPref :  { [key: string]: string[] } = {};
    studPref : { [key: string]: string[] } = {};
    pData : { [key: string]: { assigned: string[]; capacity: number } } = {} as { [key: string]: { assigned: string[]; capacity: number } };
  
    objectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
      }
      
    
      studentAssignments: { [key: string]: string } = {};
      projectAssignments :{ [key: string]: string[] } = {};
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
          this.runStudentSPA();
        }
      }
      
    
    //   let freeStudents = new Set(Object.keys(studentPrefMapping));

    //   // if there are free projects
    //   while (freeStudents.size > 0) {
    //     console.log("Free projects:", Array.from(freeStudents));
    //     // broadcast("Free projects:" + JSON.stringify(Array.from(freeStudents)));
    
    // // free proj at that instance
    //     for (let student_id of Array.from(freeStudents)) {
    //       let prefList = studentPrefMapping[student_id];
    //       if (!prefList || prefList.length === 0) {
    //         freeStudents.delete(student_id);
    //         console.log(`Student ${student_id} has no more projects to propose to. Removing from freeStudents.`);
    //         continue;
    //       }
    
    //       // if not using shift(), the student gets proposed to that project again and again
    //       // first preferred project is selected then the other .. and so on..
    //       let project_id = prefList.shift();
    //       console.log(`student_id ${student_id} proposes to project ${project_id}`);
    
    //       // if in the preference mapping of the student, the project is not present, the student is skipped
    //       if (!facPrefMapping[project_id] || !facPrefMapping[project_id].includes(Number(student_id))) {
    //         console.log(`project ${project_id} does not have student ${project_id} in their preferences. Proposal rejected.`);
    //         continue;
    //       }
    
    //       // if the project is preferred, 
    //       // the already assigned project to it is removed and this project is assigned and the 
    //       // old project is added back to free projects, 
    //       // and the student is removed from the assigned of old project
    //       if (projectData[project_id].assigned.length < projectData[project_id].capacity) { 
    //         // let oldProject = studentAssignments[student_id];
    //         // projectData[oldProject].assigned = projectData[oldProject].assigned.filter(s => s !== student_id);
    //         // freeProjects.add(String(oldProject));
    //         // console.log(`Student ${student_id} was reassigned from project ${oldProject} to project ${project_id}.`);
    //         if (projectData[project_id].assigned.length === 0){
    //           projectAssignments[project_id] = [];
    //         }
    //         projectAssignments[project_id].push(student_id); 
    //         projectData[project_id].assigned.push(student_id);
    //         freeStudents.delete(student_id);
    //       }
    //       else {
    //         let assigned = projectData[project_id].assigned;
    //         let facultyPref = facPrefMapping[project_id] || [];
    //         let worstStudent = assigned.reduce((worst, s) => {
    //           // If the student s ranks lower (i.e. appears later in the facultyPref list)
    //           // than the current worst, then update worst.
    //           if (worst === null) return s;
    //           let worstIndex = facultyPref.indexOf(worst);
    //           let sIndex = facultyPref.indexOf(s);
    //           return sIndex > worstIndex ? s : worst;
    //         }, null);
    //         projectData[project_id].assigned = assigned.filter(s => s !== worstStudent);
    //         freeStudents.add(String(worstStudent));
    //         console.log(`Project ${project_id} over-subscribed: removed worst student ${worstStudent}`);
    //       }
    
    //       if (projectData[project_id].assigned.includes(Number(student_id))) {
    //         freeStudents.delete(student_id);
          
    //       // all the projects after the project in the preference of that student is removed
    //       let idx = facPrefMapping[project_id].indexOf(Number(student_id));
    //       if (idx !== -1) {
    //         let removed = facPrefMapping[project_id].splice(idx + 1);
    //         console.log(`Removed successors from projects ${project_id}'s preference list after assignment to student ${student_id}:`, removed);
    //       }
          
    //       console.log(`Project ${project_id} assigned student ${student_id}`);
    
    //     }}
    //   }
      
    //   console.log("Final student assignments:", projectAssignments);
    //   return projectAssignments;
    
    // }
    runStudentSPA() {
      const remainingStudentPref = JSON.parse(JSON.stringify(this.studPref));
      let freeStudents = new Set(Object.keys(this.studPref));
  
      let stepsCount = 0;
      const maxSteps = 1000;
  
      while (freeStudents.size > 0 && stepsCount++ < maxSteps) {
        for (let student of Array.from(freeStudents)) {
          const prefs = remainingStudentPref[student];
          if (!prefs || prefs.length === 0) {
            freeStudents.delete(student);
            continue;
          }
  
          const project = prefs[0];
          let message = `Student ${student} applies to Project ${project}. `;
  
          if (!this.projPref[project] || !this.projPref[project].includes(student)) {
            message += `Proposal rejected (not in project's preference).`;
            this.steps.push({
              message,
              assignments: JSON.parse(JSON.stringify(this.projectAssignments)),
              studentPref: JSON.parse(JSON.stringify(remainingStudentPref)),
              projectState: JSON.parse(JSON.stringify(this.pData))
            });
            continue;
          }
  
          if (this.pData[project].assigned.length < this.pData[project].capacity) {
            if (!this.projectAssignments[project]) {
              this.projectAssignments[project] = [];
            }
            this.projectAssignments[project].push(student);
            this.pData[project].assigned.push(student);
            freeStudents.delete(student);
            message += `Accepted.`;
          } else {
            let assigned = this.pData[project].assigned;
            let facultyPref = this.projPref[project] || [];
            let worstStudent = assigned.reduce((worst, s) => {
              let worstIndex = facultyPref.indexOf(worst);
              let sIndex = facultyPref.indexOf(s);
              return sIndex > worstIndex ? s : worst;
            }, assigned[0]);
  
            if (facultyPref.indexOf(student) < facultyPref.indexOf(worstStudent)) {
              this.pData[project].assigned = assigned.filter(s => s !== worstStudent);
              this.pData[project].assigned.push(student);
              freeStudents.delete(student);
              freeStudents.add(worstStudent);
              message += `Accepted, replaced worse student ${worstStudent}.`;
            } else {
              message += `Rejected due to lower preference.`;
            }
          }
  
          // Remove this project from student's pref after applying
          remainingStudentPref[student] = prefs.filter((pid: string) => pid !== project);
  
          this.steps.push({
            message,
            assignments: JSON.parse(JSON.stringify(this.projectAssignments)),
            studentPref: JSON.parse(JSON.stringify(remainingStudentPref)),
            projectState: JSON.parse(JSON.stringify(this.pData))
          });
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
