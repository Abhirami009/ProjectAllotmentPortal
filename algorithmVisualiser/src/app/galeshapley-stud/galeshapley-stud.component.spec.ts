import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaleshapleyStudComponent } from './galeshapley-stud.component';

describe('GaleshapleyStudComponent', () => {
  let component: GaleshapleyStudComponent;
  let fixture: ComponentFixture<GaleshapleyStudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaleshapleyStudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GaleshapleyStudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
