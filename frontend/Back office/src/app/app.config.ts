import {APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // 1. Import this
import { HTTP_INTERCEPTORS } from '@angular/common/http'; // 2. Import this

import { routes } from './app.routes';
import { KeycloakService} from "keycloak-angular";
import { initializeKeycloak} from "./keycloak-init";
import { AuthInterceptor } from './shared/interceptors/auth.interceptor'; // 3. Import your Interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // 4. Enable HttpClient
    provideHttpClient(withInterceptorsFromDi()),

    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },

    // 5. Register the Auth Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};