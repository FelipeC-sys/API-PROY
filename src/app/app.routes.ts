import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "",
    loadChildren: () => import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES)
  },
  {
    path: "tickets",
    canActivate: [authGuard],
    loadChildren: () => import("./features/tickets/tickets.routes").then((m) => m.TICKETS_ROUTES)
  }
];
