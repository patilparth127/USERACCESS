import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { AccessService } from '../services/access.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appPermission]',
  standalone: false
})
export class PermissionDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appPermission') permission!: string;
  
  private hasView = false;
  private subscription: Subscription | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  ngOnChanges(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView(): void {
    if (this.permission) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      
      this.subscription = this.accessService.hasPermission(this.permission)
        .subscribe(hasPermission => {
          if (hasPermission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
          } else if (!hasPermission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
          }
        });
    }
  }
}
