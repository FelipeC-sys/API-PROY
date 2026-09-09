import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";

import { TicketService } from "../../../core/services/ticket.service";
import { AuthService } from "../../../core/services/auth.service";
import { UserService } from "../../../core/services/user.service";
import { Ticket, TicketComment, TicketStatus } from "../../../core/models/ticket.model";
import { User } from "../../../core/models/user.model";

@Component({
  selector: "app-ticket-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./ticket-detail.component.html",
  styleUrl: "./ticket-detail.component.scss"
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  readonly ticket = signal<Ticket | null>(null);
  readonly comments = signal<TicketComment[]>([]);
  readonly agents = signal<User[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sendingComment = signal(false);
  readonly savingStatus = signal(false);
  readonly assigning = signal(false);

  newComment = "";
  selectedStatus: TicketStatus | "" = "";
  selectedAgentId = "";

  readonly statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

  readonly role = computed(() => this.authService.role());

  // Agente: solo si el ticket es suyo. Administrador: siempre.
  readonly canUpdateStatus = computed(() => {
    const t = this.ticket();
    const role = this.role();
    if (!t) return false;
    if (role === "admin") return true;
    if (role === "agent") return t.assignedTo === this.authService.currentUser()?.id;
    return false;
  });

  readonly canAssign = computed(() => this.role() === "admin");

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.load(id);
    }

    if (this.canAssign()) {
      this.userService.listAgents().subscribe({
        next: (agents) => this.agents.set(agents)
      });
    }
  }

  private load(id: string): void {
    this.loading.set(true);
    this.ticketService.getById(id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.selectedStatus = ticket.status;
        this.selectedAgentId = ticket.assignedTo ?? "";
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set("No fue posible cargar el ticket.");
        this.loading.set(false);
      }
    });

    this.ticketService.getComments(id).subscribe({
      next: (comments) => this.comments.set(comments)
    });
  }

  addComment(): void {
    const ticket = this.ticket();
    if (!ticket || !this.newComment.trim()) return;

    this.sendingComment.set(true);
    this.ticketService.addComment(ticket.id, this.newComment.trim()).subscribe({
      next: (comment) => {
        this.comments.update((list) => [...list, comment]);
        this.newComment = "";
        this.sendingComment.set(false);
      },
      error: () => {
        this.sendingComment.set(false);
      }
    });
  }

  updateStatus(): void {
    const ticket = this.ticket();
    if (!ticket || !this.selectedStatus) return;

    this.savingStatus.set(true);
    this.ticketService.update(ticket.id, { status: this.selectedStatus }).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.savingStatus.set(false);
      },
      error: () => {
        this.savingStatus.set(false);
      }
    });
  }

  assignAgent(): void {
    const ticket = this.ticket();
    if (!ticket || !this.selectedAgentId) return;

    this.assigning.set(true);
    this.ticketService.assign(ticket.id, this.selectedAgentId).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.assigning.set(false);
      },
      error: () => {
        this.assigning.set(false);
      }
    });
  }
}
