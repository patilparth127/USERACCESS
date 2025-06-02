import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccessService } from '../../../core/services/access.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: false,
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card mt-5">
            <div class="card-header">Register</div>
            <div class="card-body">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    formControlName="name"
                    [ngClass]="{ 'is-invalid': submitted && f['name'].errors }">
                  <div *ngIf="submitted && f['name'].errors" class="invalid-feedback">
                    <div *ngIf="f['name'].errors['required']">Name is required</div>
                    <div *ngIf="f['name'].errors['minlength']">Name must be at least 3 characters</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    formControlName="email"
                    [ngClass]="{ 'is-invalid': submitted && f['email'].errors }">
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    <div *ngIf="f['email'].errors['required']">Email is required</div>
                    <div *ngIf="f['email'].errors['email']">Email must be a valid email address</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="password"
                    [ngClass]="{ 'is-invalid': submitted && f['password'].errors }">
                  <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
                    <div *ngIf="f['password'].errors['required']">Password is required</div>
                    <div *ngIf="f['password'].errors['minlength']">Password must be at least 6 characters</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    formControlName="confirmPassword"
                    [ngClass]="{ 'is-invalid': submitted && f['confirmPassword'].errors }">
                  <div *ngIf="submitted && f['confirmPassword'].errors" class="invalid-feedback">
                    <div *ngIf="f['confirmPassword'].errors['required']">Confirm Password is required</div>
                    <div *ngIf="f['confirmPassword'].errors['mustMatch']">Passwords must match</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="roleId" class="form-label">Role</label>
                  <select 
                    class="form-select" 
                    id="roleId" 
                    formControlName="roleId"
                    [ngClass]="{ 'is-invalid': submitted && f['roleId'].errors }">
                    <option value="">Select a role</option>
                    <option *ngFor="let role of roles" [value]="role.id">{{ role.name }}</option>
                  </select>
                  <div *ngIf="submitted && f['roleId'].errors" class="invalid-feedback">
                    <div *ngIf="f['roleId'].errors['required']">Role is required</div>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Register
                  </button>
                </div>
                
                <div class="text-center mt-3">
                  <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
                </div>
                
                <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                  {{ errorMessage }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  roles: any[] = [];
  isAdmin = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private accessService: AccessService
  ) {}
  
  ngOnInit() {
    // Check if current user has admin permissions
    this.accessService.hasPermission('Users.CreateUser').subscribe(
      can => {
        this.isAdmin = can;
        
        // Redirect if not allowed
        if (!this.isAdmin) {
          this.router.navigate(['/home']);
          return;
        }
        
        // Initialize form
        this.registerForm = this.formBuilder.group({
          name: ['', [Validators.required, Validators.minLength(3)]],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required],
          roleId: ['', Validators.required]
        }, {
          validator: this.mustMatch('password', 'confirmPassword')
        });
        
        // Load available roles
        this.loadRoles();
      }
    );
  }
  
  // Load roles from API
  loadRoles() {
    fetch(`${this.authService['API_URL']}/roles`)
      .then(response => response.json())
      .then(data => {
        this.roles = data;
      })
      .catch(error => {
        console.error('Error loading roles:', error);
        this.errorMessage = 'Failed to load roles';
      });
  }
  
  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }
  
  // Custom validator to check that two fields match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors?.['mustMatch']) {
        // Return if another validator has already found an error
        return;
      }

      // Set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }
  
  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    
    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const userData = {
      name: this.f['name'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      roleId: this.f['roleId'].value
    };
    
    // this.authService.register(userData)
    //   .pipe(finalize(() => this.loading = false))
    //   .subscribe({
    //     next: () => {
    //       this.router.navigate(['/users/manage'], { 
    //         queryParams: { registered: true }
    //       });
    //     },
    //     error: error => {
    //       this.errorMessage = error.message || 'Registration failed';
    //       console.error('Registration error:', error);
    //     }
    //   });
  }
}
