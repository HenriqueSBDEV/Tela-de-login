import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads profile from /api/me on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ email: 'aluno@uesc.br' });
    fixture.detectChanges();

    expect(fixture.componentInstance.email).toBe('aluno@uesc.br');
    expect(fixture.nativeElement.textContent).toContain('aluno@uesc.br');
  });
});
