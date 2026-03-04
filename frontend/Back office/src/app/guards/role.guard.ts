import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private keycloak: KeycloakService, private router: Router) {}

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        const requiredRoles: string[] = route.data['roles'] || [];

<<<<<<< HEAD
        // Allow only doctor, admin, nurse or labTech
        if (userRoles.includes('doctor') || userRoles.includes('admin') || userRoles.includes('nurse') || userRoles.includes('labTech')) {
            return true;
        }

        // Otherwise, logout and go back to Keycloak login page
        await this.keycloak.logout();
        return false;
    }
=======
        const loggedIn = await this.keycloak.isLoggedIn();
        if (!loggedIn) {
            await this.keycloak.login();
            return false;
        }

        if (requiredRoles.length === 0) return true;

        const userRoles = (this.keycloak.getUserRoles(true) || []).map(r => r.toLowerCase());
        const needed = requiredRoles.map(r => r.toLowerCase());

        // DEBUG
        console.log('needed=', needed, 'userRoles=', userRoles);

        const ok = needed.some(r => userRoles.includes(r));
        return ok ? true : this.router.parseUrl('/unauthorized');
    }

>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
}