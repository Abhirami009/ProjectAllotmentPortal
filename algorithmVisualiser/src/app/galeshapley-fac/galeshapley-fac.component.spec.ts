import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaleshapleyFacComponent } from './galeshapley-fac.component';

describe('GaleshapleyFacComponent', () => {
  let component: GaleshapleyFacComponent;
  let fixture: ComponentFixture<GaleshapleyFacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaleshapleyFacComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GaleshapleyFacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
