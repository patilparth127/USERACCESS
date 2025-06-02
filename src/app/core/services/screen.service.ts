import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime, startWith, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  private isMobileSubject = new BehaviorSubject<boolean>(window.innerWidth < 768);
  public isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    // Monitor window resize events
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        map(() => window.innerWidth < 768),
        startWith(window.innerWidth < 768)
      )
      .subscribe(isMobile => {
        this.isMobileSubject.next(isMobile);
      });
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
