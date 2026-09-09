import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import { TicketService } from "../../../core/services/ticket.service";
import { TicketPriority } from "../../../core/models/ticket.model";

@Component({
  selector: "app-ticket-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./ticket-form.component.html",
  styleUrl: "./ticket-form.component.scss"
})
export class TicketFormComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

  form = this.fb.group({
    title: ["", [Validators.required]],
    description: ["", [Validators.required]],
    priority: ["medium" as TicketPriority, [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .create(this.form.getRawValue() as { title: string; description: string; priority: TicketPriority })
      .subscribe({
        next: (ticket) => {
          this.loading.set(false);
          this.router.navigate(["/tickets", ticket.id]);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set("No fue posible crear el ticket.");
        }
      });
  }
}
