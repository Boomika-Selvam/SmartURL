import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.message = 'Please fill all fields. Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.register(this.registerForm.value).subscribe(
      () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error => {
        this.loading = false;
        this.message = error.error && error.error.message ? error.error.message : 'Registration failed.';
      }
    );
  }
}

