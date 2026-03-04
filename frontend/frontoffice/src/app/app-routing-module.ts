import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth-guard';
<<<<<<< HEAD
import { DiagnosticComponent } from './diagnostic/diagnostic.component';
import { HospitalizationComponent } from './hospitalization/hospitalization.component';
import { DiagnosticCalendarComponent } from './diagnostic-calendar/diagnostic-calendar.component'; // ← AJOUTÉ
=======
import {DiagnosticComponent} from './diagnostic/diagnostic.component';
import {HospitalizationComponent} from './hospitalization/hospitalization.component';
import { NotificationsComponent } from './Notifications/Notifications.component';
import { ProfileComponent } from './Profile/Profile.component';
import { ClinicalComponent } from './clinical/clinical.component';
>>>>>>> f196738805fbbfd9801e4df05a28d4909d4ae2dd


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'diagnostic',
    component: DiagnosticComponent,
    canActivate: [AuthGuard],
    data: { roles: ['labTech'] }
  },
  {
    path: 'diagnostic-calendar',          // ← AJOUTÉ
    component: DiagnosticCalendarComponent,
    canActivate: [AuthGuard],
    data: { roles: ['labTech'] }
  },
  {
    path: 'clinical',
    component: ClinicalComponent
  },
  {
    path: 'hospitalization',
    component: HospitalizationComponent
  },
  { path: 'notifications', 
    component: NotificationsComponent 
  },
  { path: 'profile', 
    component: ProfileComponent 
  },
  
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }