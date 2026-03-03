import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiagnosticComponent } from './diagnostic/diagnostic.component';
import { HospitalizationComponent } from './hospitalization/hospitalization.component';
import { DialysisComponent} from './Dialysis/dialysis.component';
// 2. Import the Functional Guards
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'diagnostic',
    component: DiagnosticComponent
  },
  {
    path: 'hospitalization',
    component: HospitalizationComponent
  },
  {
    path: 'dialysis',
    component: DialysisComponent,
    canActivate: [authGuard]
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
