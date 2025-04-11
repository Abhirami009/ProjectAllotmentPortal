import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyDashboardComponent } from './faculty-dashboard.component';

describe('FacultyDashboardComponent', () => {
  let component: FacultyDashboardComponent;
  let fixture: ComponentFixture<FacultyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacultyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
