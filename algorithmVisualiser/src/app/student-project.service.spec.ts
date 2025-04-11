import { TestBed } from '@angular/core/testing';

import { StudentProjectService } from './student-project.service';

describe('StudentProjectService', () => {
  let service: StudentProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
