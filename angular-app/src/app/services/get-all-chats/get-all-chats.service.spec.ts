import { TestBed } from '@angular/core/testing';

import { GetAllChatsService } from './get-all-chats.service';

describe('GetAllChatsService', () => {
  let service: GetAllChatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAllChatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
