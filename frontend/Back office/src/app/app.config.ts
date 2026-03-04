import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
=======
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { initializeKeycloak } from './keycloak-init';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
<<<<<<< HEAD
    provideHttpClient(withInterceptorsFromDi()), 
=======
    provideHttpClient(withInterceptorsFromDi()), // ✅ conflit résolu
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
<<<<<<< HEAD
    }
  ]
=======
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
};