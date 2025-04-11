import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaLecturerComponent } from './spa-lecturer.component';

describe('SpaLecturerComponent', () => {
  let component: SpaLecturerComponent;
  let fixture: ComponentFixture<SpaLecturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaLecturerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpaLecturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
