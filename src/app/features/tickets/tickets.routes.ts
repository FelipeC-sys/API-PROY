import { Routes } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const TICKETS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./ticket-list/ticket-list.component").then((m) => m.TicketListComponent)
  },
  {
    path: "new",
    canActivate: [roleGuard],
    data: { roles: ["client", "admin"] },
    loadComponent: () => import("./ticket-form/ticket-form.component").then((m) => m.TicketFormComponent)
  },
  {
    path: ":id",
    loadComponent: () => import("./ticket-detail/ticket-detail.component").then((m) => m.TicketDetailComponent)
  }
];
