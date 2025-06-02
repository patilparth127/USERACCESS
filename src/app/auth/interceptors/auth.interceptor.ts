import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding auth header since we're not using tokens anymore
    // Just pass the request through
    
    // Skip interceptor if needed
    if (request.headers.has('Skip-Interceptor')) {
      const newRequest = request.clone({
        headers: request.headers.delete('Skip-Interceptor')
      });
      return next.handle(newRequest);
    }
    
    // Just pass the request through without modification
    return next.handle(request);
  }
}
