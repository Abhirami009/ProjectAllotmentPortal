import { Component, EventEmitter, Input, Output } from '@angular/core';
import { application, preference, project } from '../models';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { response } from 'express';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApplicationDataService } from '../application-data.service';


@Component({
  selector: 'app-preference',
  standalone: true,
  imports: [DragDropModule, CommonModule],
  templateUrl: './preference.component.html',
  styleUrl: './preference.component.css'
})
export class PreferenceComponent {
  @Input() applications : application[] = [];
  @Input() project_id : number | undefined;
  @Input() faculty_id : number | undefined;
  @Output() pref = new EventEmitter<boolean>();
  preferences : preference[] = [];

  constructor(private serv : ApplicationDataService) {}


ngOnInit(){
  if (this.project_id){
  this.serv.getPref(this.project_id).subscribe({
    next: (Data) => {
      this.preferences = Data.sort((a, b) => a.rank - b.rank);
      console.log(this.preferences);
    },
    error: (error) => {
      console.error('Error fetching preference data:', error);
      alert('Failed to load preference  data. Please try again.');
    }
  });
}
}

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.applications, event.previousIndex, event.currentIndex);
  }

  savePreferences() {
    const preferences = this.applications.map((app, index) => ({
      student_id: app.roll_no,
      faculty_id:this.faculty_id,
      project_id : this.project_id,
      preference_rank: index + 1
    }));
    console.log("the preferences pushed" ,preferences);

    this.serv.savePreferences(preferences).subscribe(
      (response) => {
        console.log("Preferences saved successfully", response);
        alert("Preferences saved!");
      },
      (error) => {
        console.error("Error saving preferences", error);
        alert("Failed to save preferences.");
      }
    );
    this.pref.emit(false);
    
  }

  back(){
    this.pref.emit(false);
  }

}
