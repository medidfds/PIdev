import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private keycloak: KeycloakService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.keycloak.updateToken(30)).pipe(
            switchMap(() => from(this.keycloak.getToken())),
            switchMap((token) => {
                if (!token) return next.handle(req);

                const authReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${token}` }
                });
                return next.handle(authReq);
            })
        );
    }
}
