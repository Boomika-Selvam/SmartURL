import { AfterViewInit, Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.message = 'Please enter a valid email and password.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.login(this.loginForm.value).subscribe(
      () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error => {
        this.loading = false;
        this.message = error.error && error.error.message ? error.error.message : 'Login failed.';
      }
    );
  }

  private renderGoogleButton(): void {
    const timer = setInterval(() => {
      if (typeof gapi === 'undefined' || !gapi.signin2) {
        return;
      }

      clearInterval(timer);
      gapi.load('auth2', () => {
        gapi.auth2.init({ client_id: environment.googleClientId });
        gapi.signin2.render('googleLoginButton', {
          scope: 'profile email',
          width: 260,
          height: 42,
          longtitle: true,
          theme: 'light',
          onsuccess: (googleUser: any) => {
            const tokenId = googleUser.getAuthResponse().id_token;
            this.zone.run(() => this.handleGoogleToken(tokenId));
          },
          onfailure: () => {
            this.zone.run(() => {
              this.message = 'Google sign-in could not be completed.';
            });
          }
        });
      });
    }, 400);
  }

  private handleGoogleToken(tokenId: string): void {
    this.loading = true;
    this.authService.googleLogin(tokenId).subscribe(
      () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error => {
        this.loading = false;
        this.message = error.error && error.error.message ? error.error.message : 'Google login failed.';
      }
    );
  }
}

