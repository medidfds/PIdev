import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';

import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {

  username: string = '';

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  async ngOnInit() {
    try {
      const loggedIn = await this.keycloakService.isLoggedIn();

      if (!loggedIn) {
        this.username = '';
        return;
      }

      // loadUserProfile can fail if not configured, so keep it guarded
      try {
        await this.keycloakService.loadUserProfile();
      } catch {
        // ignore
      }

      this.username = this.keycloakService.getUsername() || '';
    } catch (e) {
      console.error('Keycloak init/profile error:', e);
      this.username = '';
    }
  }


  logout() {
    this.keycloakService.logout('http://localhost:4200'); // redirect back to Angular app
  }

  register () {
    this.keycloakService.register();
  }
}
