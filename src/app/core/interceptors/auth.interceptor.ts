import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip interceptor if the Skip-Interceptor header is present
    if (request.headers.has('Skip-Interceptor')) {
      // Create a new request without the Skip-Interceptor header
      const newRequest = request.clone({
        headers: request.headers.delete('Skip-Interceptor')
      });
      return next.handle(newRequest);
    }
    
    // No longer adding auth token to requests
    return next.handle(request);
  }
}
