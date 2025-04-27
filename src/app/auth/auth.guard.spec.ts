import { TestBed } from '@angular/core/testing';
import { AuthGuard } from '../auth/auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { isAuthenticated: of(true) });
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard); // Inyectamos el guard
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if authenticated', (done) => {
    authServiceSpy.isAuthenticated = of(true);

    guard.canActivate().subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should deny access and navigate if not authenticated', (done) => {
    authServiceSpy.isAuthenticated = of(false);

    guard.canActivate().subscribe(result => {
      expect(result).toBeFalse();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
      done();
    });
  });
});
