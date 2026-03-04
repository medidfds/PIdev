import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import keycloakConfig from './keycloak.config';
import { DiagnosticComponent } from './diagnostic/diagnostic.component';
import { HospitalizationComponent } from './hospitalization/hospitalization.component';
<<<<<<< HEAD
import { DiagnosticCalendarComponent } from './diagnostic-calendar/diagnostic-calendar.component'; // ← AJOUTÉ
=======
import { ClinicalComponent } from './clinical/clinical.component';

import { NotificationsComponent } from './Notifications/Notifications.component';
import { ProfileComponent } from './Profile/Profile.component';
<<<<<<< HEAD
>>>>>>> f196738805fbbfd9801e4df05a28d4909d4ae2dd

=======
import { PharmacyComponent } from './pharmacy/pharmacy.component';
import {DiagnosticCalendarComponent} from './diagnostic-calendar/diagnostic-calendar.component'
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      },
    });
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    DiagnosticComponent,
    HospitalizationComponent,
<<<<<<< HEAD
    DiagnosticCalendarComponent,   // ← AJOUTÉ
=======
    NotificationsComponent,
    ProfileComponent,
    ClinicalComponent,
<<<<<<< HEAD
>>>>>>> f196738805fbbfd9801e4df05a28d4909d4ae2dd
=======
    PharmacyComponent,
    DiagnosticCalendarComponent
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    KeycloakAngularModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}