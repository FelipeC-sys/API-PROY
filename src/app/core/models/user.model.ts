export type Role = "client" | "agent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface UpdateRoleRequest {
  role: Role;
}
