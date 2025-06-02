import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Repurposed to handle localStorage for backward compatibility
  private readonly USER_KEY = 'current_user';
  
  getToken(): string | null { 
    // For backward compatibility, return a mock token if user exists
    return this.hasToken() ? 'mock-token' : null;
  }
  
  setToken(token: string): void {
    // No-op since we're not using tokens anymore
  }
  
  removeToken(): void {
    localStorage.removeItem(this.USER_KEY);
  }
  
  hasToken(): boolean { 
    return !!localStorage.getItem(this.USER_KEY);
  }
}
