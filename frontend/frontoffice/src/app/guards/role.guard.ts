import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

// This guard checks if the user has the specific role (e.g., 'patient')
export const roleGuard = (expectedRole: string): CanActivateFn => {
  return async (route, state) => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);

    const isLoggedIn = await keycloakService.isLoggedIn();

    if (!isLoggedIn) {
      router.navigate(['']);
      return false;
    }

    // Check role
    const hasRole = keycloakService.isUserInRole(expectedRole);

    if (!hasRole) {
      // If they are logged in but have the wrong role (e.g. Doctor trying to access Patient page)
      console.warn(`Access Denied: Requires role '${expectedRole}'`);
      router.navigate(['']); // Redirect to home
      return false;
    }

    return true;
  };
};
