import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private keycloak: KeycloakService, private router: Router) {}

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        const requiredRoles: string[] = route.data['roles'] || [];

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

}