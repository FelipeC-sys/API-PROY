import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";

import { TicketService } from "../../../core/services/ticket.service";
import { Ticket, TicketComment } from "../../../core/models/ticket.model";

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

  readonly ticket = signal<Ticket | null>(null);
  readonly comments = signal<TicketComment[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sendingComment = signal(false);

  newComment = "";

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.load(id);
    }
  }

  private load(id: string): void {
    this.loading.set(true);
    this.ticketService.getById(id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
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
}
