import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreRoutingModule } from './core-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageNotFoundComponent } from './components/page.not.found/page.not.found.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { PermissionDirective } from './directives/permission.directive';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    ForbiddenComponent,
    PermissionDirective,
    SidebarComponent
  ],

  imports: [
    CommonModule,
    CoreRoutingModule,
    RouterModule,
  ],

  exports: [
    HeaderComponent,
    FooterComponent,
    PermissionDirective,
    SidebarComponent
  ],

  providers: [
    // Remove any HTTP_INTERCEPTORS registrations from here
  ]
})

export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Prevent reimporting the CoreModule
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
