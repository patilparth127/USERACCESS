import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpInterceptorService } from './core/interceptors/api.interceptor';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { CoreModule } from "./core/core.module";
import { InitService } from './core/services/init.service';
import { InitComponent } from './core/components/init/init.component';

// Factory function to initialize the app
export function initializeApp(initService: InitService) {
  return () => initService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,InitComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule
],
  exports: [
    InitComponent // Export InitComponent to be used in the app component
  ],
  providers: [
    // Make sure interceptors are only registered here, not in CoreModule or elsewhere
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Add APP_INITIALIZER to run initialization code before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [InitService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
