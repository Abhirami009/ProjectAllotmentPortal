import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaStudentComponent } from './spa-student.component';

describe('SpaStudentComponent', () => {
  let component: SpaStudentComponent;
  let fixture: ComponentFixture<SpaStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaStudentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpaStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
