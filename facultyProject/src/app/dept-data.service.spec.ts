import { TestBed } from '@angular/core/testing';

import { DeptDataService } from './dept-data.service';

describe('DeptDataService', () => {
  let service: DeptDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeptDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
