import { TestBed } from '@angular/core/testing';

import { PropubService } from './propub.service';

describe('PropubService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PropubService = TestBed.get(PropubService);
    expect(service).toBeTruthy();
  });
});
