import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/api-error.model';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        this.loading.set(false);
        this.redirectByRole(this.authService.role());
      },
      error: (err: { error?: ApiError }) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error?.message ?? 'Credenciales inválidas. Intenta de nuevo.');
      }
    });
  }

  private redirectByRole(role: Role | null): void {
    switch (role) {
      case 'admin':
        this.router.navigateByUrl('/admin');
        break;
      case 'agent':
        this.router.navigateByUrl('/agent');
        break;
      default:
        this.router.navigateByUrl('/tickets');
    }
  }
}