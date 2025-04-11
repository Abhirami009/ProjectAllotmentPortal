import { TestBed } from '@angular/core/testing';

import { CourseDataService } from './course-data.service';

describe('CourseDataService', () => {
  let service: CourseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
