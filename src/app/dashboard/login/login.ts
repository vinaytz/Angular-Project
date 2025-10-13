import { Component } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLoading = false;
  error = '';
  showSignup = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['freelancer', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard/home']);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.isLoading = true;
      this.error = '';
      
      const { confirmPassword, agreeTerms, ...signupData } = this.signupForm.value;
      
      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard/home']);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Signup failed. Please try again.';
        }
      });
    }
  }

  switchToSignup(): void {
    this.showSignup = true;
    this.error = '';
  }

  switchToLogin(): void {
    this.showSignup = false;
    this.error = '';
  }

  setUserType(type: 'freelancer' | 'client'): void {
    this.signupForm.patchValue({ userType: type });
  }

}
