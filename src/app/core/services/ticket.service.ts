import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import {
  CreateTicketRequest,
  PaginatedResponse,
  Ticket,
  TicketComment,
  TicketFilters
} from "../models/ticket.model";

@Injectable({ providedIn: "root" })
export class TicketService {
  private http = inject(HttpClient);

  list(filters: TicketFilters): Observable<PaginatedResponse<Ticket>> {
    let params = new HttpParams()
      .set("page", String(filters.page ?? 1))
      .set("limit", String(filters.pageSize ?? 10));

    if (filters.status) params = params.set("status", filters.status);
    if (filters.priority) params = params.set("priority", filters.priority);

    return this.http.get<PaginatedResponse<Ticket>>(`${environment.apiUrl}/tickets`, { params });
  }

  getById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${environment.apiUrl}/tickets/${id}`);
  }

  create(payload: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${environment.apiUrl}/tickets`, payload);
  }

  update(id: string, payload: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${environment.apiUrl}/tickets/${id}`, payload);
  }

  assign(id: string, agentId: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${environment.apiUrl}/tickets/${id}/assign`, { agentId });
  }

  getComments(ticketId: string): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(`${environment.apiUrl}/tickets/${ticketId}/comments`);
  }

  addComment(ticketId: string, message: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`${environment.apiUrl}/tickets/${ticketId}/comments`, { message });
  }
}
