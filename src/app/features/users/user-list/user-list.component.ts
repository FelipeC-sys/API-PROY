import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { UserService } from "../../../core/services/user.service";
import { Role, User } from "../../../core/models/user.model";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./user-list.component.html",
  styleUrl: "./user-list.component.scss"
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly savingUserId = signal<string | null>(null);

  readonly roles: Role[] = ["client", "agent", "admin"];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set("No fue posible cargar los usuarios.");
        this.loading.set(false);
      }
    });
  }

  changeRole(user: User, newRole: Role): void {
    if (newRole === user.role) return;

    this.savingUserId.set(user.id);
    this.userService.updateRole(user.id, newRole).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.savingUserId.set(null);
      },
      error: () => {
        this.savingUserId.set(null);
      }
    });
  }
}
