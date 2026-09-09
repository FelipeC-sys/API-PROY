import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { TicketService } from "../../../core/services/ticket.service";
import { AuthService } from "../../../core/services/auth.service";
import { Ticket, TicketPriority, TicketStatus } from "../../../core/models/ticket.model";

@Component({
  selector: "app-ticket-list",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./ticket-list.component.html",
  styleUrl: "./ticket-list.component.scss"
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);

  readonly tickets = signal<Ticket[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  statusFilter: TicketStatus | "" = "";
  priorityFilter: TicketPriority | "" = "";

  readonly statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
  readonly priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

  readonly canCreate = computed(() => {
    const role = this.authService.role();
    return role === "client" || role === "admin";
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .list({
        status: this.statusFilter || undefined,
        priority: this.priorityFilter || undefined,
        page: this.page(),
        pageSize: this.pageSize
      })
      .subscribe({
        next: (res) => {
          this.tickets.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set("No fue posible cargar los tickets.");
          this.loading.set(false);
        }
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.load();
  }
}
