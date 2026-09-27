import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores and returns the access token', () => {
    service.setToken('jwt-token');
    expect(service.getToken()).toBe('jwt-token');
  });

  it('clears the token', () => {
    service.setToken('jwt-token');
    service.clear();
    expect(service.getToken()).toBeNull();
  });
});
