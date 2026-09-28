import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('login posts credentials and stores only the access token', () => {
    service.login('aluno@uesc.br', 'senha123').subscribe((res) => {
      expect(res.accessToken).toBe('abc.jwt.token');
      expect(res.tokenType).toBe('Bearer');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'aluno@uesc.br', senha: 'senha123' });
    req.flush({ accessToken: 'abc.jwt.token', tokenType: 'Bearer', expiresIn: 3600 });

    expect(tokenStorage.getToken()).toBe('abc.jwt.token');
  });

  it('me calls the protected endpoint', () => {
    service.me().subscribe((me) => {
      expect(me.email).toBe('aluno@uesc.br');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ email: 'aluno@uesc.br' });
  });

  it('isAuthenticated reflects token presence', () => {
    expect(service.isAuthenticated()).toBeFalse();
    tokenStorage.setToken('token');
    expect(service.isAuthenticated()).toBeTrue();
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
