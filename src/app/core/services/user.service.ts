import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Role, User } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);

  // Solo para administradores (requerimiento "Gestion de usuarios").
  list(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  updateRole(userId: string, role: Role): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}/role`, { role });
  }

  // Usado por el selector de "asignar agente" en el detalle de ticket.
  listAgents(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`, { params: { role: "agent" } });
  }
}
