import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  returnUrl = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });


    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';


    if (this.authService.isAuthenticated()) {
      console.log('User already logged in, redirecting...');
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          console.log('Login successful');

          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Login error:', error);


          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to the server. Please ensure JSON Server is running at http://localhost:3000';
          } else if (error.status === 401 || error.status === 403) {
            this.errorMessage = 'Invalid email or password';
          } else if (error.status === 404) {
            this.errorMessage = 'User not found. Please check your email.';
          } else {
            this.errorMessage = error.message || 'An error occurred during login';
          }
        }
      });
  }
}
