import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();
    
    // Skip interceptor for login requests to avoid circular dependency
    if (request.headers.has('Skip-Interceptor')) {
      const newHeaders = request.headers.delete('Skip-Interceptor');
      const newRequest = request.clone({ headers: newHeaders });
      return next.handle(newRequest);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('API Error', error);
        
        // Handle authentication errors
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        
        // Handle connection errors with better messages
        if (error.status === 0) {
          console.error('Cannot connect to API server. Please ensure JSON Server is running.');
        }
        
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}
