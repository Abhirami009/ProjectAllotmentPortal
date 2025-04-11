import { TestBed } from '@angular/core/testing';

import { FacultydataService } from './facultydata.service';

describe('FacultydataService', () => {
  let service: FacultydataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacultydataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
