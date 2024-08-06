import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './services/authService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    const isLoginOrRegistrationPage = this.router.url.includes('loginPage') || this.router.url.includes('registrationPage');
    if (!isLoginOrRegistrationPage && !this.authService.isAuthenticated()) {
      // Navigate to the login page if not already there and not authenticated
      this.router.navigate(['/loginPage'], { relativeTo: this.route });
    }
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      // User is authenticated, navigate to the home page
      this.router.navigate(['/homePage']);
    } else {
      // User is not authenticated, stay on the current page
      const currentUrl = this.router.url;
      if (currentUrl !== '/loginPage' && currentUrl !== '/registrationPage') {
        this.router.navigate(['/loginPage']);
      }
    }
  }
}
