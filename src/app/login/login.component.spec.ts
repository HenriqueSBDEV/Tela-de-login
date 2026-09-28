import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    sessionStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('on successful login stores token, clears password and navigates home', () => {
    component.email = 'aluno@uesc.br';
    component.senha = 'senha123';

    component.entrar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ accessToken: 'jwt.token', tokenType: 'Bearer', expiresIn: 3600 });

    expect(sessionStorage.getItem('accessToken')).toBe('jwt.token');
    expect(component.senha).toBe('');
    expect(component.erro).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('on failed login shows error and clears password', () => {
    component.email = 'aluno@uesc.br';
    component.senha = 'errada';

    component.entrar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(component.senha).toBe('');
    expect(component.erro).toBe('E-mail ou senha inválidos.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
