import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Preference, StepState } from '../models';
import { StudentProjectService } from '../student-project.service';

@Component({
  selector: 'app-preference',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preference.component.html',
  styleUrl: './preference.component.css'
})
export class PreferenceComponent {


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
              // this.tryRunSPA() ;
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
              // this.tryRunSPA() ; // Attempt to run once all data is in
            },
            error: (error) => {
              console.error('Error fetching project preferences:', error);
              alert('Failed to load project preferences.');
            }
          });
        }

        getRank(prefList: string[], id: string): string {
          const index = prefList.indexOf(id);
          return index >= 0 ? `#${index + 1}` : '-';
        }
        
        getHeatColor(prefList: string[], id: string): { [klass: string]: any } {
          const index = prefList.indexOf(id);
          if (index === -1) return { backgroundColor: '#f8d7da' }; // light red for not ranked
        
          // Map preference rank to green → yellow → red
          const percent = index / (prefList.length - 1 || 1); // avoid div by 0
          const red = Math.round(255 * percent);
          const green = Math.round(255 * (1 - percent));
          return { backgroundColor: `rgb(${red}, ${green}, 100)` };
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
