import { TestBed } from '@angular/core/testing';

import { MakeGuessService } from './make-guess.service';

describe('MakeGuessService', () => {
  let service: MakeGuessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MakeGuessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
